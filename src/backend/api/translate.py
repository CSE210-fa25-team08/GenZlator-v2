from fastapi import APIRouter

from core.models import TranslateRequest, TranslateResponse
from core.openrouter_client import call_openrouter_race
import json
from typing import Dict

router = APIRouter(prefix="/api/v1", tags=["translate"])

@router.post("/translate", response_model=TranslateResponse)
async def translate(req: TranslateRequest):
    direction = "text_to_emoji" if req.isToEmoji else "emoji_to_text"

    history = (req.chatHistory or [])[-2:]
    history_snippet = "\n".join(f"- {m}" for m in history) if history else "None"

    system_prompt = (
        "You are a bidirectional translator between English text and emoji chains.\n"
        "- When direction is 'text_to_emoji', convert the original message into a concise "
        "emoji sequence that preserves meaning and tone.\n"
        "- When direction is 'emoji_to_text', convert the emoji sequence into natural, concise English.\n"
        "- Always respond in STRICT JSON with the following structure:\n"
        "{"
        '  "translatedMessage": "<string>",'
        "}"
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

    race_result = await call_openrouter_race(messages)
    raw_content = race_result["content"]

    extracted = extract_translation(raw_content)

    return TranslateResponse(
        translatedMessage=extracted["translatedMessage"],
    )

def extract_translation(raw_content: str) -> Dict[str, str]:
    content = raw_content.strip()
    start = content.find("{")
    end = content.rfind("}")
    if start != -1 and end != -1 and end > start:
        json_candidate = content[start : end + 1]
    else:
        json_candidate = content

    translated = None

    try:
        parsed = json.loads(json_candidate)
        translated = parsed.get("translatedMessage") or parsed.get("translation")
    except Exception:
        translated = content

    return {
        "translatedMessage": translated or "",
    }
