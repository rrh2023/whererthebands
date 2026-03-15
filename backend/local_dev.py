# backend/functions/get_events/handler.py
"""
Lambda: GET /events
Fetches upcoming music events from Ticketmaster near a given city/location.
Requires: TICKETMASTER_API_KEY env var
Auth: Cognito JWT via API Gateway authorizer
"""

import json
import os
import logging
from datetime import datetime, timezone

import requests

logger = logging.getLogger()
logger.setLevel(logging.INFO)

TICKETMASTER_BASE = "https://app.ticketmaster.com/discovery/v2/events.json"
NOMINATIM_BASE    = "https://nominatim.openstreetmap.org/search"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": os.environ.get("ALLOWED_ORIGIN", "*"),
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Content-Type": "application/json",
}


def handler(event, context):
    # Handle CORS preflight
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return error_response(400, "Invalid JSON body")

    location = body.get("location", "").strip()
    radius   = int(body.get("radius", 25))
    size     = min(int(body.get("size", 20)), 50)  # cap at 50

    if not location:
        return error_response(400, "Missing required field: location")

    api_key = os.environ.get("TICKETMASTER_API_KEY")
    if not api_key:
        logger.error("TICKETMASTER_API_KEY not set")
        return error_response(500, "Server configuration error")

    # Geocode the location to lat/lng so radius search works for
    # small cities, suburbs, and zip codes (Ticketmaster city= is exact-match only)
    coords = _geocode(location)

    params = {
        "apikey":             api_key,
        "radius":             radius,
        "unit":               "miles",
        "classificationName": "music",
        "size":               size,
        "sort":               "date,asc",
        "countryCode":        "US",
    }

    if coords:
        # geoPoint gives radius-based search from coordinates — most reliable
        params["geoPoint"] = f"{coords['lat']},{coords['lng']}"
        logger.info("Geocoded '%s' → %s", location, params["geoPoint"])
    else:
        # Fall back to Ticketmaster's own city/zip matching
        logger.warning("Geocoding failed for '%s', falling back to direct lookup", location)
        if location.replace("-", "").isdigit():
            params["postalCode"] = location
        else:
            params["city"] = location

    # Only pull future events (Ticketmaster default includes past sometimes)
    params["startDateTime"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    logger.info("Fetching events: %s", params)

    try:
        resp = requests.get(TICKETMASTER_BASE, params=params, timeout=10)
        resp.raise_for_status()
    except requests.Timeout:
        return error_response(504, "Ticketmaster API timed out")
    except requests.HTTPError as e:
        logger.error("Ticketmaster HTTP error: %s", e)
        return error_response(502, "Upstream events API error")
    except requests.RequestException as e:
        logger.error("Ticketmaster request failed: %s", e)
        return error_response(502, "Failed to reach events API")

    data = resp.json()
    raw_events = data.get("_embedded", {}).get("events", [])

    if not raw_events:
        logger.info("No events found for location: %s", location)
        return success_response([])

    cleaned = [_parse_event(e) for e in raw_events]
    # Filter out any events that failed parsing
    cleaned = [e for e in cleaned if e is not None]

    logger.info("Returning %d events for '%s'", len(cleaned), location)
    return success_response(cleaned)


def _geocode(location: str) -> dict | None:
    """
    Convert a city name or zip code to lat/lng using OpenStreetMap Nominatim.
    Returns {"lat": float, "lng": float} or None on failure.
    """
    is_zip = location.replace("-", "").isdigit()
    params = {
        "q":              location if not is_zip else f"{location}, USA",
        "format":         "json",
        "addressdetails": 0,
        "limit":          1,
        "countrycodes":   "us",
    }
    try:
        resp = requests.get(
            NOMINATIM_BASE,
            params=params,
            timeout=5,
            headers={"User-Agent": "WhereRTheBands/1.0"},
        )
        resp.raise_for_status()
        results = resp.json()
        if results:
            return {"lat": float(results[0]["lat"]), "lng": float(results[0]["lon"])}
    except Exception as ex:
        logger.warning("Nominatim geocoding error for '%s': %s", location, ex)
    return None


def _parse_event(e: dict) -> dict | None:
    """Normalize a raw Ticketmaster event into our app's shape."""
    try:
        embedded    = e.get("_embedded", {})
        venues      = embedded.get("venues", [{}])
        attractions = embedded.get("attractions", [])
        images      = e.get("images", [])
        dates       = e.get("dates", {})
        start       = dates.get("start", {})
        price_range = e.get("priceRanges", [{}])[0] if e.get("priceRanges") else {}

        # Best image: prefer 16:9 ratio at ~640px width
        best_image = _pick_image(images)

        # Genre + subgenre
        classifications = e.get("classifications", [{}])
        genre    = classifications[0].get("genre", {}).get("name", "Music")
        subgenre = classifications[0].get("subGenre", {}).get("name", "")

        venue = venues[0] if venues else {}
        city  = venue.get("city", {}).get("name", "")
        state = venue.get("state", {}).get("stateCode", "")

        return {
            "id":          e.get("id"),
            "name":        e.get("name", "Unknown Event"),
            "date":        start.get("localDate"),
            "time":        start.get("localTime"),
            "dateTbd":     start.get("dateTBD", False),
            "timeTbd":     start.get("timeTBD", False),
            "venue":       venue.get("name", "Unknown Venue"),
            "city":        f"{city}, {state}" if city and state else city,
            "genre":       genre if genre != "Undefined" else "Music",
            "subgenre":    subgenre if subgenre not in ("Undefined", "") else None,
            "image":       best_image,
            "url":         e.get("url"),
            "artists":     [a.get("name") for a in attractions if a.get("name")],
            "minPrice":    price_range.get("min"),
            "maxPrice":    price_range.get("max"),
            "currency":    price_range.get("currency", "USD"),
            "status":      dates.get("status", {}).get("code", "onsale"),
        }
    except Exception as ex:
        logger.warning("Failed to parse event %s: %s", e.get("id"), ex)
        return None


def _pick_image(images: list) -> str | None:
    """Pick the best event image — prefer 16:9, ~640px wide."""
    if not images:
        return None
    preferred = [
        img for img in images
        if img.get("ratio") == "16_9" and img.get("width", 0) >= 640
    ]
    fallback = [img for img in images if img.get("ratio") == "16_9"]
    pool = preferred or fallback or images
    return pool[0].get("url") if pool else None


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