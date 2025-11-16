import os
import json
from datetime import datetime
from typing import Dict

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse

from models import (
    TranslateRequest,
    TranslateResponse,
    TranslateResponseMetadata,
    FeedbackRequest,
    FeedbackResponse,
)
from openrouter_client import call_openrouter_race

FEEDBACK_LOG_PATH = os.getenv("FEEDBACK_LOG_PATH", "feedback_log.jsonl")

app = FastAPI(
    title="Emoji Translator Backend",
    version="1.0.0",
    description="Core Translation & Feedback APIs powered by OpenRouter with model racing.",
)


def extract_translation_and_tone(raw_content: str) -> Dict[str, str]:
    """
    Try to parse JSON object from model output and extract:
    - translatedMessage
    - tone (metadata.tone or top-level tone)
    Falls back to treating entire output as translatedMessage.
    """
    content = raw_content.strip()
    start = content.find("{")
    end = content.rfind("}")
    if start != -1 and end != -1 and end > start:
        json_candidate = content[start : end + 1]
    else:
        json_candidate = content

    translated = None
    tone = None

    try:
        parsed = json.loads(json_candidate)
        translated = parsed.get("translatedMessage") or parsed.get("translation")
        meta = parsed.get("metadata") or {}
        tone = meta.get("tone") or parsed.get("tone")
    except Exception:
        translated = content
        tone = None

    return {
        "translatedMessage": translated or "",
        "tone": tone or None,
    }


@app.post("/api/v1/translate", response_model=TranslateResponse)
async def translate(req: TranslateRequest):
    """
    Core Translation API

    - originalMessage: string
    - isToEmoji: True → Text2Emoji, False → Emoji2Text
    - chatHistory: optional, truncated to last 2 entries
    - Uses OpenRouter and races multiple free models; first success wins.
    """

    direction = "text_to_emoji" if req.isToEmoji else "emoji_to_text"

    # Aggressive truncation of chatHistory
    history = (req.chatHistory or [])[-2:]
    history_snippet = "\n".join(f"- {m}" for m in history) if history else "None"

    system_prompt = (
        "You are a bidirectional translator between English text and emoji chains.\n"
        "- When direction is 'text_to_emoji', convert the original message into a concise "
        "emoji sequence that preserves meaning and tone.\n"
        "- When direction is 'emoji_to_text', convert the emoji sequence into natural, "
        "concise English.\n"
        "- Always respond in STRICT JSON with the following structure:\n"
        "{\n"
        '  \"translatedMessage\": \"<string>\",\n'
        '  \"metadata\": {\n'
        '    \"tone\": \"<short tone phrase like \'Extreme Laughter\', '
        "'Mild Sarcasm', 'Neutral'>\"\n"
        "  }\n"
        "}\n"
        "- Do not include any extra keys, explanation, or commentary.\n"
    )

    user_prompt = (
        f"Direction: {direction}\n"
        f"Original message: {req.originalMessage}\n"
        f"Recent chat history (may be empty or partial):\n{history_snippet}\n"
        "Return ONLY the JSON object as specified."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    # 🚀 Race between free OpenRouter models; first success wins
    race_result = await call_openrouter_race(messages)
    raw_content = race_result["content"]

    extracted = extract_translation_and_tone(raw_content)

    return TranslateResponse(
        translatedMessage=extracted["translatedMessage"],
        metadata=TranslateResponseMetadata(tone=extracted["tone"]),
    )


@app.post("/api/v1/feedback", response_model=FeedbackResponse, status_code=202)
async def submit_feedback(req: FeedbackRequest):
    """
    Feedback API

    - Stores feedback in JSONL format for offline analysis.
    - Returns 202 Accepted on success.
    """

    feedback_record = {
        "timestamp": datetime.utcnow().isoformat(),
        "originalInput": req.originalInput,
        "correctionText": req.correctionText,
        "anonymousId": req.anonymousId,
        "rating": req.rating,
    }

    try:
        with open(FEEDBACK_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(feedback_record, ensure_ascii=False) + "\n")
    except Exception as e:
        # If you prefer hard failure, you can raise HTTPException instead.
        raise HTTPException(status_code=500, detail=f"Failed to store feedback: {str(e)}")

    return FeedbackResponse(status="accepted")


@app.get("/healthz")
async def health_check():
    return JSONResponse({"status": "ok"})
