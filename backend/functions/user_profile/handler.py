# backend/functions/user_profile/handler.py
"""
Lambda: GET|PUT|PATCH /profile, POST /profile/saved, DELETE /profile/saved/{eventId}
Manages user preferences and saved shows in DynamoDB.
Requires: AWS credentials (provided automatically by Lambda execution role)
Auth: Cognito JWT via API Gateway authorizer (user ID extracted from JWT claims)
"""

import json
import os
import logging
from datetime import datetime, timezone
from decimal import Decimal

import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

TABLE_NAME = os.environ.get("USERS_TABLE", "whereRTheBands-users")

dynamodb = boto3.resource("dynamodb")
table    = dynamodb.Table(TABLE_NAME)

CORS_HEADERS = {
    "Access-Control-Allow-Origin": os.environ.get("ALLOWED_ORIGIN", "*"),
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Allow-Methods": "GET,PUT,PATCH,POST,DELETE,OPTIONS",
    "Content-Type": "application/json",
}

# Fields users are allowed to set
ALLOWED_PROFILE_FIELDS = {
    "genres", "artists", "location", "radius", "displayName", "notificationsEnabled"
}


def handler(event, context):
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    user_id = _extract_user_id(event)
    if not user_id:
        return error_response(401, "Unauthorized — missing user identity")

    method   = event.get("httpMethod", "GET")
    path     = event.get("path", "/profile")
    path_params = event.get("pathParameters") or {}

    logger.info("user_profile: %s %s for user %s", method, path, user_id)

    try:
        # Route dispatch
        if path.endswith("/saved") and method == "POST":
            return _save_event(user_id, event)

        if "/saved/" in path and method == "DELETE":
            event_id = path_params.get("eventId") or path.split("/saved/")[-1]
            return _unsave_event(user_id, event_id)

        if method == "GET":
            return _get_profile(user_id)

        if method == "PUT":
            return _replace_profile(user_id, event)

        if method == "PATCH":
            return _update_profile(user_id, event)

        return error_response(405, f"Method {method} not allowed")

    except ClientError as e:
        code = e.response["Error"]["Code"]
        logger.error("DynamoDB error [%s]: %s", code, e)
        if code == "ResourceNotFoundException":
            return error_response(503, "Database table not found — check deployment")
        return error_response(500, "Database error")

    except Exception as e:
        logger.exception("Unexpected error: %s", e)
        return error_response(500, "Internal server error")


# ── Handlers ────────────────────────────────────────────────────────────────

def _get_profile(user_id: str):
    result = table.get_item(Key={"userId": user_id})
    item   = result.get("Item")

    if not item:
        # Return empty profile instead of 404 — frontend can handle first-run
        return success_response({
            "userId":     user_id,
            "genres":     [],
            "artists":    [],
            "savedShows": [],
            "createdAt":  None,
        })

    return success_response(_serialize(item))


def _replace_profile(user_id: str, event: dict):
    """Full profile replacement (onboarding save)."""
    body = _parse_body(event)
    if body is None:
        return error_response(400, "Invalid JSON body")

    now   = _now_iso()
    # Preserve createdAt if it already exists
    existing = table.get_item(Key={"userId": user_id}).get("Item", {})
    created_at = existing.get("createdAt", now)

    filtered = {k: v for k, v in body.items() if k in ALLOWED_PROFILE_FIELDS}

    item = {
        "userId":    user_id,
        "updatedAt": now,
        "createdAt": created_at,
        "savedShows": existing.get("savedShows", []),
        **filtered,
    }

    table.put_item(Item=item)
    logger.info("Profile replaced for user %s", user_id)
    return success_response({"success": True, "updatedAt": now})


def _update_profile(user_id: str, event: dict):
    """Partial profile update (settings changes)."""
    body = _parse_body(event)
    if body is None:
        return error_response(400, "Invalid JSON body")

    filtered = {k: v for k, v in body.items() if k in ALLOWED_PROFILE_FIELDS}
    if not filtered:
        return error_response(400, "No valid fields to update")

    now = _now_iso()
    update_expr  = "SET updatedAt = :ts"
    expr_values  = {":ts": now}
    expr_names   = {}

    for i, (key, val) in enumerate(filtered.items()):
        placeholder = f":v{i}"
        # Use expression attribute names to avoid reserved word conflicts
        name_placeholder = f"#k{i}"
        update_expr += f", {name_placeholder} = {placeholder}"
        expr_values[placeholder] = val
        expr_names[name_placeholder] = key

    table.update_item(
        Key={"userId": user_id},
        UpdateExpression=update_expr,
        ExpressionAttributeValues=expr_values,
        ExpressionAttributeNames=expr_names,
    )

    logger.info("Profile patched for user %s: fields=%s", user_id, list(filtered.keys()))
    return success_response({"success": True, "updatedAt": now})


def _save_event(user_id: str, event: dict):
    """Add a show to the user's saved list (list_append)."""
    body = _parse_body(event)
    if body is None:
        return error_response(400, "Invalid JSON body")

    show = body.get("show")
    if not show or not show.get("id"):
        return error_response(400, "Missing required field: show.id")

    show["savedAt"] = _now_iso()

    # Use list_append — create savedShows if it doesn't exist
    table.update_item(
        Key={"userId": user_id},
        UpdateExpression=(
            "SET savedShows = list_append(if_not_exists(savedShows, :empty), :show), "
            "updatedAt = :ts"
        ),
        ExpressionAttributeValues={
            ":show":  [show],
            ":empty": [],
            ":ts":    _now_iso(),
        },
    )

    logger.info("User %s saved show %s", user_id, show["id"])
    return success_response({"success": True, "savedId": show["id"]})


def _unsave_event(user_id: str, event_id: str):
    """Remove a show from saved list by filtering it out."""
    result  = table.get_item(Key={"userId": user_id})
    item    = result.get("Item", {})
    current = item.get("savedShows", [])

    updated = [s for s in current if s.get("id") != event_id]

    if len(updated) == len(current):
        return error_response(404, f"Show {event_id} not in saved list")

    table.update_item(
        Key={"userId": user_id},
        UpdateExpression="SET savedShows = :shows, updatedAt = :ts",
        ExpressionAttributeValues={
            ":shows": updated,
            ":ts":    _now_iso(),
        },
    )

    logger.info("User %s unsaved show %s", user_id, event_id)
    return success_response({"success": True})


# ── Helpers ─────────────────────────────────────────────────────────────────

def _extract_user_id(event: dict) -> str | None:
    """Pull the Cognito sub (user ID) from the JWT authorizer claims."""
    try:
        return (
            event.get("requestContext", {})
                 .get("authorizer", {})
                 .get("claims", {})
                 .get("sub")
        )
    except (AttributeError, KeyError):
        return None


def _parse_body(event: dict) -> dict | None:
    try:
        return json.loads(event.get("body") or "{}")
    except (json.JSONDecodeError, TypeError):
        return None


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _serialize(item: dict) -> dict:
    """Convert Decimal types (DynamoDB quirk) back to int/float."""
    def convert(obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        if isinstance(obj, dict):
            return {k: convert(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [convert(i) for i in obj]
        return obj
    return convert(item)


def success_response(data):
    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps(data, default=str),
    }


def error_response(status: int, message: str):
    return {
        "statusCode": status,
        "headers": CORS_HEADERS,
        "body": json.dumps({"error": message}),
    }