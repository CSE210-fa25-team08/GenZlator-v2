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
        "gpt-4o-mini": {
            "name": "GPT-4o Mini",
            "description": "Compact version of GPT-4o with excellent performance-to-speed ratio",
            "provider": "OpenAI",
            "max_tokens": 4096,
            "strengths": [
                "Fast response times",
                "Good instruction following",
                "Excellent emoji understanding",
            ],
            "use_cases": [
                "Real-time emoji translation",
                "Quick conversational context",
                "High-volume translation requests",
            ],
            "performance_notes": "Best balance of speed and quality for production use",
        },
        "gpt-3.5-turbo": {
            "name": "GPT-3.5 Turbo",
            "description": "Reliable and fast model for general-purpose translation",
            "provider": "OpenAI",
            "max_tokens": 4096,
            "strengths": [
                "Fast inference",
                "Reliable performance",
                "Good contextual understanding",
            ],
            "use_cases": [
                "Standard emoji translation",
                "Contextual understanding",
                "Multilingual support",
            ],
            "performance_notes": "Proven workhorse model with consistent performance",
        },
        "gpt-4.1-mini": {
            "name": "GPT-4.1 Mini",
            "description": "Lightweight GPT-4.1 variant maintaining high quality accuracy",
            "provider": "OpenAI",
            "max_tokens": 8192,
            "strengths": [
                "Better reasoning",
                "Improved accuracy",
                "Efficient token usage",
            ],
            "use_cases": [
                "Complex emoji sequences",
                "Nuanced translations",
                "Context-rich scenarios",
            ],
            "performance_notes": "Higher quality translations with improved reasoning capability",
        },
        "gpt-4.1-nano": {
            "name": "GPT-4.1 Nano",
            "description": "Ultra-lightweight model for rapid processing and minimal latency",
            "provider": "OpenAI",
            "max_tokens": 4096,
            "strengths": ["Extremely fast", "Lowest latency", "High throughput"],
            "use_cases": [
                "High-volume requests",
                "Real-time applications",
                "Throughput-critical scenarios",
            ],
            "performance_notes": "Fastest option, optimized for throughput over complexity",
        },
    }

    for i, model_id in enumerate(LIGHT_MODELS):
        details = model_details.get(model_id, {})
        model_name = details.get("name", model_id.split("/")[-1].replace(":free", ""))
        provider = details.get("provider", model_id.split("/")[0])
        model_description = details.get(
            "performance_notes", f"Free model from {provider}"
        )

        models.append(
            ModelInfo(
                model_id=str(i),
                name=model_name,
                description=model_description,
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
async def get_model_details(model_id: int):
    """
    Get detailed information about a specific model

    Returns comprehensive information about the requested model if it's supported.
    """
    if model_id < 0 or model_id >= len(LIGHT_MODELS):
        from fastapi import HTTPException

        raise HTTPException(
            status_code=404, detail=f"Model {model_id} not found or not supported"
        )

    actual_model_id = LIGHT_MODELS[model_id]

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
        "gpt-4o-mini": {
            "name": "GPT-4o Mini",
            "description": "Compact version of GPT-4o with excellent performance-to-speed ratio",
            "provider": "OpenAI",
            "max_tokens": 4096,
            "strengths": [
                "Fast response times",
                "Good instruction following",
                "Excellent emoji understanding",
            ],
        },
        "gpt-3.5-turbo": {
            "name": "GPT-3.5 Turbo",
            "description": "Reliable and fast model for general-purpose translation",
            "provider": "OpenAI",
            "max_tokens": 4096,
            "strengths": [
                "Fast inference",
                "Reliable performance",
                "Good contextual understanding",
            ],
        },
        "gpt-4.1-mini": {
            "name": "GPT-4.1 Mini",
            "description": "Lightweight GPT-4.1 variant maintaining high quality accuracy",
            "provider": "OpenAI",
            "max_tokens": 8192,
            "strengths": [
                "Better reasoning",
                "Improved accuracy",
                "Efficient token usage",
            ],
        },
        "gpt-4.1-nano": {
            "name": "GPT-4.1 Nano",
            "description": "Ultra-lightweight model for rapid processing and minimal latency",
            "provider": "OpenAI",
            "max_tokens": 4096,
            "strengths": ["Extremely fast", "Lowest latency", "High throughput"],
        },
    }

    details = model_details.get(actual_model_id, {})

    return {
        "model_id": model_id,
        "model_name": actual_model_id,
        "is_free": True,
        "is_available": True,
        "racing_participant": True,
        **details,
    }
