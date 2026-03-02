# backend/functions/get_recommendations/handler.py
"""
Lambda: POST /recommendations
Passes user taste profile + event list to Claude.
Returns top 5 personalized picks with match scores and explanations.
Requires: ANTHROPIC_API_KEY env var
Auth: Cognito JWT via API Gateway authorizer
"""

import json
import os
import logging
import re

import anthropic

logger = logging.getLogger()
logger.setLevel(logging.INFO)

CORS_HEADERS = {
    "Access-Control-Allow-Origin": os.environ.get("ALLOWED_ORIGIN", "*"),
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Content-Type": "application/json",
}

MAX_EVENTS_TO_SEND = 20  # Don't blow up the context window
MAX_RETRIES = 2


def handler(event, context):
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return error_response(400, "Invalid JSON body")

    genres      = body.get("genres", [])
    artists     = body.get("artists", [])
    events_list = body.get("events", [])

    if not events_list:
        return error_response(400, "No events provided to rank")

    if not genres and not artists:
        return error_response(400, "Provide at least one genre or artist preference")

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        logger.error("ANTHROPIC_API_KEY not set")
        return error_response(500, "Server configuration error")

    # Trim events to avoid token overuse
    events_to_rank = events_list[:MAX_EVENTS_TO_SEND]
    # Strip unnecessary fields before sending to Claude
    slim_events = [_slim_event(e) for e in events_to_rank]

    prompt = _build_prompt(genres, artists, slim_events)
    logger.info(
        "Requesting recs for genres=%s, %d events",
        genres, len(slim_events)
    )

    client = anthropic.Anthropic(api_key=api_key)

    for attempt in range(MAX_RETRIES + 1):
        try:
            message = client.messages.create(
                model="claude-opus-4-6",
                max_tokens=1800,
                system=(
                    "You are a deeply knowledgeable music expert and live-show recommender. "
                    "You write in a direct, enthusiastic tone — like a friend who knows the scene. "
                    "Always respond with valid JSON only. No markdown, no preamble."
                ),
                messages=[{"role": "user", "content": prompt}],
            )

            raw_text = message.content[0].text.strip()
            recs = _parse_claude_response(raw_text)

            # Validate that all returned event_ids exist in our list
            valid_ids = {e["id"] for e in events_to_rank}
            recs = [r for r in recs if r.get("event_id") in valid_ids]

            logger.info("Claude returned %d recommendations", len(recs))
            return success_response(recs)

        except anthropic.RateLimitError:
            logger.warning("Claude rate limit hit (attempt %d)", attempt + 1)
            if attempt == MAX_RETRIES:
                return error_response(429, "AI service rate limit reached — try again shortly")

        except anthropic.APIError as e:
            logger.error("Claude API error: %s", e)
            if attempt == MAX_RETRIES:
                return error_response(502, "AI service unavailable")

        except (json.JSONDecodeError, ValueError) as e:
            logger.warning("Failed to parse Claude response (attempt %d): %s", attempt + 1, e)
            if attempt == MAX_RETRIES:
                return error_response(502, "AI returned an unreadable response")

    return error_response(500, "Unexpected error generating recommendations")


def _slim_event(e: dict) -> dict:
    """Send only the fields Claude needs — keeps tokens low."""
    return {
        "id":       e.get("id"),
        "name":     e.get("name"),
        "artists":  e.get("artists", []),
        "genre":    e.get("genre"),
        "subgenre": e.get("subgenre"),
        "venue":    e.get("venue"),
        "city":     e.get("city"),
        "date":     e.get("date"),
    }


def _build_prompt(genres: list, artists: list, events: list) -> str:
    genre_str  = ", ".join(genres) if genres else "Not specified"
    artist_str = ", ".join(artists) if artists else "Not specified"

    return f"""
You are helping a music fan find their perfect live shows.

USER TASTE PROFILE:
- Favorite genres: {genre_str}
- Artists they love: {artist_str}

UPCOMING CONCERTS IN THEIR AREA:
{json.dumps(events, indent=2)}

TASK:
Select the 5 best matches for this listener. Use your knowledge of the artists, genres, and musical connections to explain WHY each show fits their taste — go beyond just matching genre labels.

Return a JSON array of exactly 5 objects with these fields:
- "event_id": string (must match an id from the list above)
- "match_score": integer 1–10 (10 = perfect match)
- "explanation": string, 2–3 sentences, conversational and specific — mention artist connections, musical similarities, or what makes the live experience special
- "vibe_tags": array of 3 short strings (e.g. "late-night energy", "guitar-driven", "intimate venue")

Rank them best-first. Return ONLY the JSON array — no other text.
""".strip()


def _parse_claude_response(raw: str) -> list:
    """
    Parse Claude's response, handling edge cases like
    accidental markdown fences or leading/trailing whitespace.
    """
    # Strip markdown code fences if present
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.MULTILINE)
    cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.MULTILINE)
    cleaned = cleaned.strip()

    parsed = json.loads(cleaned)

    if not isinstance(parsed, list):
        raise ValueError(f"Expected a JSON array, got {type(parsed)}")

    # Validate required fields
    required = {"event_id", "match_score", "explanation", "vibe_tags"}
    for i, item in enumerate(parsed):
        missing = required - set(item.keys())
        if missing:
            raise ValueError(f"Item {i} missing fields: {missing}")
        if not isinstance(item["vibe_tags"], list):
            item["vibe_tags"] = [item["vibe_tags"]]
        item["match_score"] = int(item["match_score"])

    return parsed


def success_response(data):
    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps(data),
    }


def error_response(status: int, message: str):
    return {
        "statusCode": status,
        "headers": CORS_HEADERS,
        "body": json.dumps({"error": message}),
    }