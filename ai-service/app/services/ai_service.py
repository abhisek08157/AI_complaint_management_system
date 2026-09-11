import os

import logging
logger = logging.getLogger(__name__)


from fastapi import HTTPException
from dotenv import load_dotenv
from google import genai

from app.schemas.complaint import AIAnalysisResponse

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is not set")

client = genai.Client(api_key=api_key)


def analyze_complaint(title: str, description: str) -> AIAnalysisResponse:

    if not title.strip():
        raise HTTPException(
            status_code=400,
            detail="Complaint title cannot be empty"
        )

    if not description.strip():
        raise HTTPException(
            status_code=400,
            detail="Complaint description cannot be empty"
        )

    prompt = f"""
You are an AI assistant for a college campus complaint management system.

Analyze the following complaint.

Title:
{title}

Description:
{description}

Classify the complaint into exactly one of these categories:
- ELECTRICAL
- PLUMBING
- NETWORKING
- FURNITURE
- CLEANING
- OTHER
If a complaint contains multiple issues, choose the category that represents the most important or urgent issue.
Do not return multiple categories.

Classify the priority into exactly one of:
- LOW
- MEDIUM
- HIGH
- CRITICAL

Priority rules:

- LOW: Minor issue with little or no immediate impact on campus activities.
- MEDIUM: Normal issue that affects some users but does not require immediate attention.
- HIGH: Serious issue affecting an important facility, many users, or normal campus operations.
- CRITICAL: Immediate safety risk, major infrastructure failure, or an issue that could cause harm or significant disruption.

If multiple issues are present, determine the priority based on the most serious issue.

Use CRITICAL only when the complaint clearly indicates an immediate safety risk or severe failure.
Do not assign HIGH or CRITICAL simply because the complaint sounds urgent.

Also generate a short, factual summary of the complaint.

Do not invent information that is not present in the complaint.
"""

    try:
        
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": AIAnalysisResponse,
            },
        )


    except Exception as e:
        logger.error("Gemini request failed: %s", e)

        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            raise HTTPException(
                status_code=429,
                detail="AI service quota exceeded. Please try again later."
            )

        raise HTTPException(
            status_code=502,
            detail="AI service failed to analyze the complaint"
        )

    try:
        return AIAnalysisResponse.model_validate_json(response.text)
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="AI returned an invalid response"
        )

