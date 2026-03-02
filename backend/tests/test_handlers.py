# backend/tests/test_handlers.py
"""
Unit tests for all three Lambda handlers.
Run with: pytest tests/ -v

Uses moto to mock DynamoDB and unittest.mock for external APIs.
Install test deps: pip install pytest moto boto3 requests-mock
"""

import json
import os
import sys
import pytest
from unittest.mock import patch, MagicMock

# Ensure env vars exist before importing handlers
os.environ.setdefault("TICKETMASTER_API_KEY", "test-tm-key")
os.environ.setdefault("ANTHROPIC_API_KEY",    "test-anthropic-key")
os.environ.setdefault("USERS_TABLE",           "whereRTheBands-users-test")
os.environ.setdefault("ALLOWED_ORIGIN",        "*")

# Add handlers to path
base = os.path.dirname(os.path.dirname(__file__)) + "/functions"
for fn in ["get_events", "get_recommendations", "user_profile"]:
    sys.path.insert(0, f"{base}/{fn}")


# ════════════════════════════════════════════════════════════════
#  Fixtures
# ════════════════════════════════════════════════════════════════

def make_apigw_event(method="POST", path="/", body=None, user_id="user-001", path_params=None):
    return {
        "httpMethod": method,
        "path": path,
        "pathParameters": path_params or {},
        "body": json.dumps(body or {}),
        "requestContext": {
            "authorizer": {
                "claims": {"sub": user_id, "email": f"{user_id}@test.com"}
            }
        },
    }

SAMPLE_TM_RESPONSE = {
    "_embedded": {
        "events": [
            {
                "id": "evt-001",
                "name": "Test Band Live",
                "dates": {
                    "start": {"localDate": "2026-04-01", "localTime": "20:00:00"},
                    "status": {"code": "onsale"},
                },
                "classifications": [
                    {
                        "genre": {"name": "Indie Rock"},
                        "subGenre": {"name": "Alternative"},
                    }
                ],
                "images": [
                    {"url": "https://example.com/img.jpg", "ratio": "16_9", "width": 1024}
                ],
                "url": "https://ticketmaster.com/event/001",
                "_embedded": {
                    "venues": [{"name": "Test Venue", "city": {"name": "Brooklyn"}, "state": {"stateCode": "NY"}}],
                    "attractions": [{"name": "Test Band"}],
                },
                "priceRanges": [{"min": 25.0, "max": 45.0, "currency": "USD"}],
            }
        ]
    }
}

SAMPLE_CLAUDE_RECS = [
    {
        "event_id": "evt-001",
        "match_score": 9,
        "explanation": "Test Band's angular guitar work fits perfectly with your Indie Rock taste.",
        "vibe_tags": ["guitar-driven", "intimate venue", "Brooklyn vibes"],
    }
]


# ════════════════════════════════════════════════════════════════
#  get_events Tests
# ════════════════════════════════════════════════════════════════

class TestGetEvents:
    def setup_method(self):
        import importlib
        spec = __import__("importlib.util").util.spec_from_file_location(
            "events", f"{base}/get_events/handler.py"
        )
        self.mod = __import__("importlib.util").util.module_from_spec(spec)
        spec.loader.exec_module(self.mod)

    def test_success_by_city(self):
        with patch("requests.get") as mock_get:
            mock_get.return_value.json.return_value = SAMPLE_TM_RESPONSE
            mock_get.return_value.raise_for_status = lambda: None

            event = make_apigw_event("POST", "/events", {"location": "Brooklyn", "radius": 10})
            result = self.mod.handler(event, {})

        assert result["statusCode"] == 200
        body = json.loads(result["body"])
        assert len(body) == 1
        assert body[0]["id"] == "evt-001"
        assert body[0]["venue"] == "Test Venue"
        assert body[0]["genre"] == "Indie Rock"
        assert body[0]["city"] == "Brooklyn, NY"

    def test_missing_location_returns_400(self):
        event = make_apigw_event("POST", "/events", {})
        result = self.mod.handler(event, {})
        assert result["statusCode"] == 400
        assert "location" in json.loads(result["body"])["error"].lower()

    def test_empty_results(self):
        with patch("requests.get") as mock_get:
            mock_get.return_value.json.return_value = {}
            mock_get.return_value.raise_for_status = lambda: None

            event = make_apigw_event("POST", "/events", {"location": "Nowhereville"})
            result = self.mod.handler(event, {})

        assert result["statusCode"] == 200
        assert json.loads(result["body"]) == []

    def test_cors_preflight(self):
        event = {**make_apigw_event(), "httpMethod": "OPTIONS"}
        result = self.mod.handler(event, {})
        assert result["statusCode"] == 200
        assert "Access-Control-Allow-Origin" in result["headers"]

    def test_ticketmaster_timeout(self):
        import requests as req
        with patch("requests.get", side_effect=req.Timeout):
            event = make_apigw_event("POST", "/events", {"location": "NYC"})
            result = self.mod.handler(event, {})
        assert result["statusCode"] == 504

    def test_zip_code_uses_postalCode_param(self):
        with patch("requests.get") as mock_get:
            mock_get.return_value.json.return_value = {}
            mock_get.return_value.raise_for_status = lambda: None

            event = make_apigw_event("POST", "/events", {"location": "10001"})
            self.mod.handler(event, {})

            call_params = mock_get.call_args[1]["params"]
            assert "postalCode" in call_params
            assert "city" not in call_params


# ════════════════════════════════════════════════════════════════
#  get_recommendations Tests
# ════════════════════════════════════════════════════════════════

class TestGetRecommendations:
    def setup_method(self):
        spec = __import__("importlib.util").util.spec_from_file_location(
            "recs", f"{base}/get_recommendations/handler.py"
        )
        self.mod = __import__("importlib.util").util.module_from_spec(spec)
        spec.loader.exec_module(self.mod)

    def _make_mock_claude(self, content: str):
        mock_message = MagicMock()
        mock_message.content = [MagicMock(text=content)]
        mock_client = MagicMock()
        mock_client.messages.create.return_value = mock_message
        return mock_client

    def test_success(self):
        sample_events = [{"id": "evt-001", "name": "Test Band Live", "genre": "Indie Rock", "artists": ["Test Band"]}]
        claude_json   = json.dumps(SAMPLE_CLAUDE_RECS)

        with patch("anthropic.Anthropic", return_value=self._make_mock_claude(claude_json)):
            event = make_apigw_event("POST", "/recommendations", {
                "genres": ["Indie Rock"],
                "events": sample_events,
            })
            result = self.mod.handler(event, {})

        assert result["statusCode"] == 200
        body = json.loads(result["body"])
        assert len(body) == 1
        assert body[0]["event_id"] == "evt-001"
        assert body[0]["match_score"] == 9
        assert len(body[0]["vibe_tags"]) == 3

    def test_no_events_returns_400(self):
        event = make_apigw_event("POST", "/recommendations", {"genres": ["Indie Rock"], "events": []})
        result = self.mod.handler(event, {})
        assert result["statusCode"] == 400

    def test_no_taste_profile_returns_400(self):
        event = make_apigw_event("POST", "/recommendations", {
            "events": [{"id": "x", "name": "Show"}]
        })
        result = self.mod.handler(event, {})
        assert result["statusCode"] == 400

    def test_invalid_claude_json_retries(self):
        responses = ["not json at all", json.dumps(SAMPLE_CLAUDE_RECS)]
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            text = responses[min(call_count, len(responses)-1)]
            call_count += 1
            msg = MagicMock()
            msg.content = [MagicMock(text=text)]
            return msg

        mock_client = MagicMock()
        mock_client.messages.create.side_effect = side_effect
        sample_events = [{"id": "evt-001", "name": "Test"}]

        with patch("anthropic.Anthropic", return_value=mock_client):
            event = make_apigw_event("POST", "/recommendations", {
                "genres": ["Indie Rock"], "events": sample_events
            })
            result = self.mod.handler(event, {})

        # Should succeed on retry
        assert result["statusCode"] == 200

    def test_filters_invalid_event_ids(self):
        """Claude should not be able to hallucinate event_ids we didn't send."""
        fake_recs = [{"event_id": "hallucinated-id-999", "match_score": 10, "explanation": "...", "vibe_tags": ["a","b","c"]}]
        sample_events = [{"id": "evt-001", "name": "Real Event", "genre": "Indie Rock", "artists": []}]

        with patch("anthropic.Anthropic", return_value=self._make_mock_claude(json.dumps(fake_recs))):
            event = make_apigw_event("POST", "/recommendations", {
                "genres": ["Indie Rock"], "events": sample_events
            })
            result = self.mod.handler(event, {})

        assert result["statusCode"] == 200
        assert json.loads(result["body"]) == []  # Hallucinated ID filtered out


# ════════════════════════════════════════════════════════════════
#  user_profile Tests
# ════════════════════════════════════════════════════════════════

class TestUserProfile:
    def setup_method(self):
        """Set up moto DynamoDB before each test."""
        import boto3
        from moto import mock_dynamodb

        self.mock = mock_dynamodb()
        self.mock.start()

        # Create the test table
        self.dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        self.table = self.dynamodb.create_table(
            TableName="whereRTheBands-users-test",
            KeySchema=[{"AttributeName": "userId", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "userId", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )

        spec = __import__("importlib.util").util.spec_from_file_location(
            "profile", f"{base}/user_profile/handler.py"
        )
        self.mod = __import__("importlib.util").util.module_from_spec(spec)
        # Re-point the module's table to our mocked one
        spec.loader.exec_module(self.mod)
        self.mod.table = self.table

    def teardown_method(self):
        self.mock.stop()

    def test_get_empty_profile(self):
        event = make_apigw_event("GET", "/profile", user_id="new-user")
        result = self.mod.handler(event, {})
        assert result["statusCode"] == 200
        body = json.loads(result["body"])
        assert body["userId"] == "new-user"
        assert body["genres"] == []

    def test_put_and_get_profile(self):
        # PUT
        put_event = make_apigw_event("PUT", "/profile", {"genres": ["Indie Rock", "Jazz"], "location": "Brooklyn"})
        put_result = self.mod.handler(put_event, {})
        assert put_result["statusCode"] == 200

        # GET
        get_event = make_apigw_event("GET", "/profile")
        get_result = self.mod.handler(get_event, {})
        body = json.loads(get_result["body"])
        assert "Indie Rock" in body["genres"]
        assert body["location"] == "Brooklyn"

    def test_patch_profile(self):
        # First PUT
        self.mod.handler(make_apigw_event("PUT", "/profile", {"genres": ["Metal"]}), {})

        # PATCH just one field
        patch_event = make_apigw_event("PATCH", "/profile", {"location": "Austin, TX"})
        self.mod.handler(patch_event, {})

        body = json.loads(self.mod.handler(make_apigw_event("GET", "/profile"), {})["body"])
        assert body["location"] == "Austin, TX"
        assert "Metal" in body["genres"]  # Previous fields preserved

    def test_save_and_unsave_show(self):
        show = {"id": "evt-001", "name": "Test Show", "date": "2026-04-01"}

        # Save
        save_event = make_apigw_event("POST", "/profile/saved", {"show": show})
        save_result = self.mod.handler(save_event, {})
        assert save_result["statusCode"] == 200

        # Verify saved
        profile = json.loads(self.mod.handler(make_apigw_event("GET", "/profile"), {})["body"])
        assert any(s["id"] == "evt-001" for s in profile["savedShows"])

        # Unsave
        unsave_event = make_apigw_event("DELETE", "/profile/saved/evt-001", path_params={"eventId": "evt-001"})
        unsave_result = self.mod.handler(unsave_event, {})
        assert unsave_result["statusCode"] == 200

        # Verify removed
        profile = json.loads(self.mod.handler(make_apigw_event("GET", "/profile"), {})["body"])
        assert not any(s["id"] == "evt-001" for s in profile.get("savedShows", []))

    def test_disallowed_fields_stripped(self):
        """Users shouldn't be able to write arbitrary fields."""
        put_event = make_apigw_event("PUT", "/profile", {
            "genres": ["Jazz"],
            "admin": True,        # should be ignored
            "userId": "hacker",  # should be ignored
        })
        self.mod.handler(put_event, {})
        profile = json.loads(self.mod.handler(make_apigw_event("GET", "/profile"), {})["body"])
        assert "admin" not in profile
        assert profile["userId"] == "user-001"  # Original user ID preserved

    def test_missing_auth_returns_401(self):
        event = make_apigw_event("GET", "/profile")
        event["requestContext"] = {}  # No authorizer claims
        result = self.mod.handler(event, {})
        assert result["statusCode"] == 401