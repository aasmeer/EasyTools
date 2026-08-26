import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel


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
    api_key=api_key
)


# ==========================================
# FASTAPI APP
# ==========================================

app = FastAPI(
    title="EasyTools AI API"
)


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

    text: str

    tone: str = "Professional"

    length: str = "Same"


# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():

    return {
        "status": "success",
        "message": "EasyTools AI Backend Running 🚀"
    }


# ==========================================
# REWRITE
# ==========================================

@app.post("/rewrite")
def rewrite_text(data: RewriteRequest):

    text = data.text.strip()

    if not text:

        raise HTTPException(
            status_code=400,
            detail="Please enter some text."
        )


    allowed_tones = [
        "Professional",
        "Simple",
        "Friendly",
        "Formal"
    ]


    allowed_lengths = [
        "Shorter",
        "Same",
        "Longer"
    ]


    tone = (
        data.tone
        if data.tone in allowed_tones
        else "Professional"
    )


    length = (
        data.length
        if data.length in allowed_lengths
        else "Same"
    )


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


    try:

        response = client.responses.create(

            model="gpt-5.6",

            instructions=instructions,

            input=text

        )


        rewritten_text = (
            response.output_text
            or ""
        ).strip()


        if not rewritten_text:

            raise RuntimeError(
                "OpenAI returned an empty response."
            )


        return {
            "success": True,
            "result": rewritten_text
        }


    except Exception as error:

        error_text = str(error).lower()

        print(
            "EasyTools AI Error:",
            repr(error)
        )


        # ==================================
        # NO API CREDITS / QUOTA
        # ==================================

        if (
            "429" in error_text
            or "insufficient_quota" in error_text
            or "credit_balance_exhausted" in error_text
            or "no credits remaining" in error_text
        ):

            raise HTTPException(
                status_code=503,
                detail=(
                    "AI Rewriter is temporarily unavailable. "
                    "Please try again later."
                )
            )


        # ==================================
        # OTHER AI ERRORS
        # ==================================

        raise HTTPException(
            status_code=500,
            detail=(
                "AI service is temporarily unavailable. "
                "Please try again later."
            )
        )
