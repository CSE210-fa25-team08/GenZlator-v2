# src/backend/routers/models_router.py
from fastapi import APIRouter
from src.backend.core.models import ModelsResponse, ModelInfo
from src.backend.core.openai_client import LIGHT_MODELS
router = APIRouter(prefix="/api/v1", tags=["models"])


@router.get("/models", response_model=ModelsResponse)
async def get_available_models():
    """
    Get list of available translation models

    Returns information about all available models currently supported by the system.
    All models listed are free-tier models from OpenRouter.
    """
    models = []

    model_details = {
        "mistralai/mistral-7b-instruct:free": {
            "name": "Mistral 7B Instruct",
            "description": "Efficient instruction-following model, good for general tasks including translation",
            "provider": "Mistral AI",
            "max_tokens": 4096,  # Note: Example token limit
            "strengths": [
                "Fast response",
                "Good instruction following",
                "Multilingual support",
            ],
        },
        "deepseek/deepseek-r1:free": {
            "name": "DeepSeek R1",
            "description": "Advanced reasoning model with strong logical capabilities",
            "provider": "DeepSeek",
            "max_tokens": 8192,
            "strengths": ["Strong reasoning", "Complex task handling", "High accuracy"],
        },
        "deepseek/deepseek-r1-distill-llama-70b:free": {
            "name": "DeepSeek R1 Distill (Llama 70B)",
            "description": "Distilled version of larger model, balances performance and speed",
            "provider": "DeepSeek",
            "max_tokens": 4096,
            "strengths": [
                "Good performance",
                "Faster than full model",
                "Efficient processing",
            ],
        },
        "cognitivecomputations/dolphin3.0-mistral-24b:free": {
            "name": "Dolphin 3.0 Mistral 24B",
            "description": "Creative and conversational model optimized for dialogue",
            "provider": "Cognitive Computations",
            "max_tokens": 4096,
            "strengths": [
                "Creative responses",
                "Good for conversation",
                "Emoji understanding",
            ],
        },
        "cognitivecomputations/dolphin-mistral-24b-venice-edition:free": {
            "name": "Dolphin Mistral 24B Venice Edition",
            "description": "Enhanced version with improved creative capabilities",
            "provider": "Cognitive Computations",
            "max_tokens": 4096,
            "strengths": [
                "Enhanced creativity",
                "Better context understanding",
                "Improved emoji translation",
            ],
        },
    }

    for model_id in LIGHT_MODELS:
        details = model_details.get(model_id, {})
        model_name = details.get("name", model_id.split("/")[-1].replace(":free", ""))
        provider = details.get("provider", model_id.split("/")[0])

        models.append(
            ModelInfo(
                model_id=model_id,
                name=model_name,
                description=details.get("description", f"Free model from {provider}"),
                is_free=True,
                max_tokens=details.get("max_tokens"),
                provider=provider,
            )
        )

    return ModelsResponse(models=models, total_count=len(models))


@router.get("/models/racing-info")
async def get_racing_info():
    """
    Get information about the model racing system

    Returns details about how the system uses multiple models for faster responses.
    """
    return {
        "racing_enabled": True,
        "strategy": "first_successful_response",
        "models_in_race": LIGHT_MODELS,
        "timeout_settings": {"per_model_timeout": 30.0, "global_timeout": 40.0},
        "description": "The system sends requests to all available models simultaneously and returns the first successful response for optimal speed and reliability.",
    }


@router.get("/models/{model_id}")
async def get_model_details(model_id: str):
    """
    Get detailed information about a specific model

    Returns comprehensive information about the requested model if it's supported.
    """
    if model_id not in LIGHT_MODELS:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=404, detail=f"Model {model_id} not found or not supported"
        )

    model_details = {
        "mistralai/mistral-7b-instruct:free": {
            "name": "Mistral 7B Instruct",
            "description": "Efficient instruction-following model, good for general tasks including translation",
            "provider": "Mistral AI",
            "max_tokens": 4096,
            "strengths": [
                "Fast response",
                "Good instruction following",
                "Multilingual support",
            ],
            "use_cases": [
                "Text to emoji translation",
                "Emoji to text translation",
                "Contextual understanding",
            ],
            "performance_notes": "Generally fast response times, good for real-time applications",
        },
        "deepseek/deepseek-r1:free": {
            "name": "DeepSeek R1",
            "description": "Advanced reasoning model with strong logical capabilities",
            "provider": "DeepSeek",
            "max_tokens": 8192,
            "strengths": ["Strong reasoning", "Complex task handling", "High accuracy"],
            "use_cases": [
                "Complex translation scenarios",
                "Context-aware translations",
                "Nuanced emoji interpretation",
            ],
            "performance_notes": "Higher accuracy but may have slightly slower response times",
        },
        "deepseek/deepseek-r1-distill-llama-70b:free": {
            "name": "DeepSeek R1 Distill (Llama 70B)",
            "description": "Distilled version of larger model, balances performance and speed",
            "provider": "DeepSeek",
            "max_tokens": 4096,
            "strengths": [
                "Good performance",
                "Faster than full model",
                "Efficient processing",
            ],
            "use_cases": [
                "Balanced translation quality",
                "Standard use cases",
                "Good fallback option",
            ],
            "performance_notes": "Good balance of speed and accuracy",
        },
        "cognitivecomputations/dolphin3.0-mistral-24b:free": {
            "name": "Dolphin 3.0 Mistral 24B",
            "description": "Creative and conversational model optimized for dialogue",
            "provider": "Cognitive Computations",
            "max_tokens": 4096,
            "strengths": [
                "Creative responses",
                "Good for conversation",
                "Emoji understanding",
            ],
            "use_cases": [
                "Creative emoji combinations",
                "Conversational context",
                "Expressive translations",
            ],
            "performance_notes": "Excellent for creative and expressive emoji translations",
        },
        "cognitivecomputations/dolphin-mistral-24b-venice-edition:free": {
            "name": "Dolphin Mistral 24B Venice Edition",
            "description": "Enhanced version with improved creative capabilities",
            "provider": "Cognitive Computations",
            "max_tokens": 4096,
            "strengths": [
                "Enhanced creativity",
                "Better context understanding",
                "Improved emoji translation",
            ],
            "use_cases": [
                "Advanced emoji interpretation",
                "Creative text generation",
                "Context-rich translations",
            ],
            "performance_notes": "Best for complex creative tasks and nuanced emoji understanding",
        },
    }

    details = model_details[model_id]

    return {
        "model_id": model_id,
        "is_free": True,
        "is_available": True,
        "racing_participant": True,
        **details,
    }
