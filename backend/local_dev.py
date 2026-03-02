# backend/local_dev.py
"""
Local development server — mirrors the Lambda API without deploying to AWS.
Run with:  uvicorn local_dev:app --reload --port 8000

Simulates Cognito auth by accepting any Bearer token in format:
  Authorization: Bearer dev-user-<your-user-id>
e.g. "Bearer dev-user-alice" → userId = "alice"

Set env vars in a .env file (python-dotenv loaded automatically):
  TICKETMASTER_API_KEY=...
  ANTHROPIC_API_KEY=...
  AWS_DEFAULT_REGION=us-east-1
  AWS_ACCESS_KEY_ID=...       ← for DynamoDB access (or use aws sso login)
  AWS_SECRET_ACCESS_KEY=...
"""

import json
import os
import sys

from dotenv import load_dotenv
load_dotenv()

# Add each function to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "functions/get_events"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "functions/get_recommendations"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "functions/user_profile"))

from fastapi import FastAPI, Request, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import handler as events_handler
import handler as recs_handler
import handler as profile_handler

# Re-import properly (avoid alias collision)
import importlib.util

def _load(name: str, path: str):
    spec = importlib.util.spec_from_file_location(name, path)
    mod  = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

_base = os.path.dirname(__file__) + "/functions"
events_mod  = _load("events_handler",  f"{_base}/get_events/handler.py")
recs_mod    = _load("recs_handler",    f"{_base}/get_recommendations/handler.py")
profile_mod = _load("profile_handler", f"{_base}/user_profile/handler.py")

app = FastAPI(title="WhereRTheBands Local Dev", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _fake_lambda_event(
    request: Request,
    body: bytes,
    path: str,
    method: str,
    authorization: str | None = None,
    path_params: dict | None = None,
) -> dict:
    """Build a dict that looks like what API Gateway passes to Lambda."""
    # Parse dev token: "Bearer dev-user-alice" → sub = "alice"
    sub = "dev-user-001"
    if authorization and authorization.startswith("Bearer dev-user-"):
        sub = authorization.split("Bearer dev-user-")[-1]

    return {
        "httpMethod": method,
        "path": path,
        "pathParameters": path_params or {},
        "headers": dict(request.headers),
        "body": body.decode() if body else "{}",
        "requestContext": {
            "authorizer": {
                "claims": {
                    "sub": sub,
                    "email": f"{sub}@dev.local",
                }
            }
        },
    }


def _lambda_to_response(result: dict) -> JSONResponse:
    body    = result.get("body", "{}")
    status  = result.get("statusCode", 200)
    parsed  = json.loads(body) if isinstance(body, str) else body
    return JSONResponse(content=parsed, status_code=status)


# ── Routes ──────────────────────────────────────────────────────────────────

@app.post("/events")
async def get_events(request: Request, authorization: str = Header(None)):
    body  = await request.body()
    event = _fake_lambda_event(request, body, "/events", "POST", authorization)
    return _lambda_to_response(events_mod.handler(event, {}))


@app.post("/recommendations")
async def get_recommendations(request: Request, authorization: str = Header(None)):
    body  = await request.body()
    event = _fake_lambda_event(request, body, "/recommendations", "POST", authorization)
    return _lambda_to_response(recs_mod.handler(event, {}))


@app.get("/profile")
async def get_profile(request: Request, authorization: str = Header(None)):
    event = _fake_lambda_event(request, b"", "/profile", "GET", authorization)
    return _lambda_to_response(profile_mod.handler(event, {}))


@app.put("/profile")
async def put_profile(request: Request, authorization: str = Header(None)):
    body  = await request.body()
    event = _fake_lambda_event(request, body, "/profile", "PUT", authorization)
    return _lambda_to_response(profile_mod.handler(event, {}))


@app.patch("/profile")
async def patch_profile(request: Request, authorization: str = Header(None)):
    body  = await request.body()
    event = _fake_lambda_event(request, body, "/profile", "PATCH", authorization)
    return _lambda_to_response(profile_mod.handler(event, {}))


@app.post("/profile/saved")
async def save_show(request: Request, authorization: str = Header(None)):
    body  = await request.body()
    event = _fake_lambda_event(request, body, "/profile/saved", "POST", authorization)
    return _lambda_to_response(profile_mod.handler(event, {}))


@app.delete("/profile/saved/{event_id}")
async def unsave_show(event_id: str, request: Request, authorization: str = Header(None)):
    event = _fake_lambda_event(
        request, b"",
        f"/profile/saved/{event_id}", "DELETE",
        authorization,
        path_params={"eventId": event_id}
    )
    return _lambda_to_response(profile_mod.handler(event, {}))


@app.get("/health")
async def health():
    return {"status": "ok", "env": os.environ.get("ENVIRONMENT", "local")}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("local_dev:app", host="0.0.0.0", port=8000, reload=True)