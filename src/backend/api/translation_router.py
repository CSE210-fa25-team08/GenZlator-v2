from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from src.backend.core.models import (
    TranslateRequest,
    TranslateResponse,
    TranslateResponseMetadata,
)
from src.backend.core.openrouter_client import call_openrouter_race
from src.backend.core.openai_client import call_openai_race
import json

# Create router instance
router = APIRouter(prefix="/api/v1", tags=["translation"])

# Import shared dependencies (we'll handle this in main.py)
prompt_manager = None
rag_system = None


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


@router.post("/translate", response_model=TranslateResponse)
async def translate(req: TranslateRequest):
    """
    Enhanced Translation API with RAG support

    - originalMessage: string to translate
    - isToEmoji: True for Text→Emoji, False for Emoji→Text
    - chatHistory: optional conversation context
    - Uses RAG system to find similar past corrections
    """
    direction = "text_to_emoji" if req.isToEmoji else "emoji_to_text"

    # Find similar feedback from RAG system
    similar_feedbacks = rag_system.find_similar_feedbacks(req.originalMessage)

    # Format chat history
    chat_history_formatted = prompt_manager.format_chat_history(req.chatHistory or [])

    if similar_feedbacks:
        # Use RAG-enhanced prompts when similar examples exist
        similar_examples_formatted = prompt_manager.format_similar_examples(
            similar_feedbacks
        )

        system_prompt = prompt_manager.get_system_prompt(
            "rag_enhanced_translator",
            direction=direction,
            similar_examples=similar_examples_formatted,
        )

        user_prompt = prompt_manager.get_user_prompt(
            "rag_enhanced_translation",
            direction=direction,
            original_message=req.originalMessage,
            chat_history=chat_history_formatted,
            similar_translations=similar_examples_formatted,
        )
    else:
        # Use basic prompts when no similar examples found
        conversion_desc = prompt_manager.prompts["prompts"]["system_prompts"][
            "base_translator"
        ]["variants"][direction]

        system_prompt = prompt_manager.get_system_prompt(
            "base_translator",
            direction=direction,
            conversion_description=conversion_desc,
        )

        user_prompt = prompt_manager.get_user_prompt(
            "basic_translation",
            direction=direction,
            original_message=req.originalMessage,
            chat_history=chat_history_formatted,
        )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    if req.model_id:
        # If frontend provided a preferred model, honor it.
        # model_id can be an index (int or numeric string) that maps to OpenAI LIGHT_MODELS,
        # or it can be a model id string like 'gpt-4o-mini' or an OpenRouter id like 'mistralai/..:free'.
        preferred = req.model_id

        # Normalize possible numeric values
        try:
            # Pydantic may coerce numeric input to int/str; handle both
            if isinstance(preferred, int) or (isinstance(preferred, str) and preferred.isdigit()):
                idx = int(preferred)
                # map index to OpenAI LIGHT_MODELS
                from src.backend.core.openai_client import LIGHT_MODELS

                if idx < 0 or idx >= len(LIGHT_MODELS):
                    raise HTTPException(status_code=400, detail="Invalid model index provided")

                actual_model = LIGHT_MODELS[idx]
                race_result = await call_openai_race(messages, models=[actual_model])
            else:
                # Non-numeric string model id
                model_str = str(preferred)
                # Heuristic: if it contains a slash or a colon assume OpenRouter-style model id
                if "/" in model_str or ":" in model_str:
                    race_result = await call_openrouter_race(messages, models=[model_str])
                else:
                    # Default to OpenAI client for simple ids like 'gpt-4o-mini'
                    race_result = await call_openai_race(messages, models=[model_str])

        except HTTPException:
            # Re-raise HTTPExceptions from above
            raise
        except Exception as e:
            # Fall back to racing default models but surface an error when appropriate
            raise HTTPException(status_code=500, detail=str(e))
    else:
        # Race multiple OpenAI models for fastest response
        race_result = await call_openai_race(messages)
    # Race multiple OpenRouter models for fastest response
    raw_content = race_result["content"]

    # Extract structured response
    extracted = extract_translation_and_tone(raw_content)

    return TranslateResponse(
        translatedMessage=extracted["translatedMessage"],
        metadata=TranslateResponseMetadata(tone=extracted["tone"]),
    )


def init_dependencies(pm, rs):
    """Initialize shared dependencies"""
    global prompt_manager, rag_system
    prompt_manager = pm
    rag_system = rs


@router.get("/test")
async def test_translate():
    """Simple test endpoint"""
    return {"message": "Translation router is working", "status": "ok"}
