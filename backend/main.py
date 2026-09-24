import os
import asyncio
import logging
from contextlib import asynccontextmanager
from collections import deque
from threading import Lock
from time import monotonic
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import (
    OpenAI, APIConnectionError, APITimeoutError, APIStatusError, RateLimitError
)
from pydantic import BaseModel, Field
from starlette.responses import JSONResponse


# ==========================================
# LOAD ENV
# ==========================================

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise RuntimeError(
        "OPENAI_API_KEY not found."
    )


# ==========================================
# OPENAI CLIENT
# ==========================================

client = OpenAI(
    api_key=api_key,
    timeout=30.0,
    max_retries=0
)


# ==========================================
# FASTAPI APP
# ==========================================

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app):
    try:
        yield
    finally:
        client.close()


app = FastAPI(
    title="EasyTools AI API",
    lifespan=lifespan
)


# Bound the received bytes before FastAPI parses JSON, including chunked bodies.
class RewriteBodyLimit:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or scope.get("path") != "/rewrite" or scope.get("method") != "POST":
            await self.app(scope, receive, send)
            return
        body = bytearray()
        deadline = asyncio.get_running_loop().time() + 10
        while True:
            try:
                message = await asyncio.wait_for(receive(), max(0.001, deadline - asyncio.get_running_loop().time()))
            except asyncio.TimeoutError:
                await JSONResponse({"detail": "Request body timed out."}, status_code=408)(scope, receive, send)
                return
            if message["type"] == "http.disconnect":
                return
            chunk = message.get("body", b"")
            if len(body) + len(chunk) > 65_536:
                await JSONResponse({"detail": "Request body exceeds 64 KB."}, status_code=413)(scope, receive, send)
                return
            body.extend(chunk)
            if not message.get("more_body", False):
                break
        delivered = False

        async def replay():
            nonlocal delivered
            if not delivered:
                delivered = True
                return {"type": "http.request", "body": bytes(body), "more_body": False}
            return await receive()

        await self.app(scope, replay, send)


app.add_middleware(RewriteBodyLimit)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://aasmeer.github.io"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# REQUEST MODEL
# ==========================================

class RewriteRequest(BaseModel):

    text: str = Field(min_length=1, max_length=10_000)

    tone: Literal["Professional", "Simple", "Friendly", "Formal"] = "Professional"

    length: Literal["Shorter", "Same", "Longer"] = "Same"


# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():

    return {
        "status": "success",
        "message": "EasyTools AI Backend Running 🚀"
    }


# Anonymous use remains available, but every provider call consumes a quota.
# These counters are per process and reset on restart. For multiple workers or
# replicas, enforce a shared quota at the gateway before scaling the deployment.
# Trust forwarded client addresses only from the hosting platform's proxy.
class RewriteLimiter:
    def __init__(self, clock=monotonic, per_minute=3, per_day=20, daily_total=100, concurrent=2):
        self.clock = clock
        self.per_minute = per_minute
        self.per_day = per_day
        self.daily_total = daily_total
        self.concurrent = concurrent
        self.calls = deque()
        self.active = 0
        self.lock = Lock()

    def acquire(self, host):
        now = self.clock()
        with self.lock:
            while self.calls and self.calls[0][0] <= now - 86400:
                self.calls.popleft()
            own = [stamp for stamp, caller in self.calls if caller == host]
            recent = [stamp for stamp in own if stamp > now - 60]
            if len(self.calls) >= self.daily_total:
                retry = max(1, int(self.calls[0][0] + 86400 - now) + 1)
                raise HTTPException(429, "The daily service limit has been reached. Please try later.", headers={"Retry-After": str(retry)})
            if len(own) >= self.per_day:
                retry = max(1, int(own[0] + 86400 - now) + 1)
                raise HTTPException(429, "Your daily rewrite limit has been reached.", headers={"Retry-After": str(retry)})
            if len(recent) >= self.per_minute:
                retry = max(1, int(recent[0] + 60 - now) + 1)
                raise HTTPException(429, "Too many rewrites. Please wait before trying again.", headers={"Retry-After": str(retry)})
            if self.active >= self.concurrent:
                raise HTTPException(429, "The rewrite service is busy. Please try again shortly.", headers={"Retry-After": "5"})
            self.calls.append((now, host))
            self.active += 1

    def release(self):
        with self.lock:
            self.active -= 1


rewrite_limiter = RewriteLimiter()


# ==========================================
# REWRITE
# ==========================================

@app.post("/rewrite")
def rewrite_text(data: RewriteRequest, request: Request):

    text = data.text.strip()

    if not text:

        raise HTTPException(
            status_code=400,
            detail="Please enter some text."
        )


    tone = data.tone
    length = data.length


    length_instruction = {

        "Shorter":
            "Make the rewritten text shorter and more concise.",

        "Same":
            "Keep approximately the same length.",

        "Longer":
            "Make the rewritten text slightly longer and more detailed."

    }


    instructions = f"""
You are a text rewriting assistant for EasyTools.

Rewrite the user's text.

Tone: {tone}

Requirements:
- Preserve the original meaning.
- Improve grammar and clarity.
- Use a {tone.lower()} writing style.
- {length_instruction[length]}
- Do not explain your changes.
- Return only the rewritten text.
"""


    host = request.client.host if request.client else "unknown"
    rewrite_limiter.acquire(host)

    try:

        response = client.responses.create(

            model="gpt-5.6",

            instructions=instructions,

            input=text,

            max_output_tokens=4096

        )


        if getattr(response, "status", None) == "incomplete":
            raise HTTPException(502, "The rewrite reached its output limit. Please try a shorter input.")

        rewritten_text = (
            response.output_text
            or ""
        ).strip()


        if not rewritten_text:

            raise HTTPException(502, "The AI service returned no text. Please try again.")


        return {

            "success": True,

            "result": rewritten_text

        }


    except HTTPException:
        # Preserve the deliberately safe errors for incomplete or empty output.
        raise
    except APITimeoutError:
        logger.warning("Rewrite provider request timed out.")
        raise HTTPException(504, "The AI service took too long to respond. Please try again.") from None
    except RateLimitError:
        logger.warning("Rewrite provider capacity or quota is unavailable.")
        raise HTTPException(
            503, "The AI service is temporarily unavailable. Please try again later.",
            headers={"Retry-After": "60"}
        ) from None
    except APIConnectionError:
        logger.warning("Rewrite provider could not be reached.")
        raise HTTPException(503, "The AI service could not be reached. Please try again later.") from None
    except APIStatusError as error:
        # Never return or log the provider body: it may contain submitted text
        # or sensitive configuration details. The status is enough for triage.
        logger.error("Rewrite provider request failed (HTTP %s).", error.status_code)
        status = 503 if error.status_code in (401, 403) else 502
        raise HTTPException(status, "The AI service could not complete the rewrite. Please try again later.") from None
    except Exception:
        logger.error("Unexpected failure while generating a rewrite.")
        raise HTTPException(500, "The rewrite could not be completed. Please try again.") from None
    finally:
        rewrite_limiter.release()
