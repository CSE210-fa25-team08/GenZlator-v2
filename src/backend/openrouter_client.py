import os
import time
import json
import asyncio
from typing import Dict, Any, List

import httpx
from fastapi import HTTPException

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Free models to race between
FREE_MODELS = [
    "mistralai/mistral-7b-instruct:free",
    "deepseek/deepseek-r1:free",
    "deepseek/deepseek-r1-distill-llama-70b:free",
    "cognitivecomputations/dolphin3.0-mistral-24b:free",
    "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
]


def _get_headers() -> Dict[str, str]:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        # Don’t crash at import, but fail clearly at call time
        raise HTTPException(
            status_code=500,
            detail="OPENROUTER_API_KEY is not set in the environment.",
        )

    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        # Optional but recommended by OpenRouter
        "HTTP-Referer": "https://your-app-url.example.com",
        "X-Title": "emoji-translator-backend",
    }


async def _call_single_model(
    client: httpx.AsyncClient,
    model: str,
    messages: List[Dict[str, str]],
    request_timeout: float = 30.0,
) -> Dict[str, Any]:
    """
    Call a single OpenRouter model and return timing + content.
    Designed to be used inside asyncio tasks (for racing).
    """
    start = time.time()
    try:
        resp = await client.post(
            f"{OPENROUTER_BASE_URL}/chat/completions",
            headers=_get_headers(),
            json={"model": model, "messages": messages},
            timeout=request_timeout,
        )
        latency = time.time() - start

        if resp.status_code != 200:
            try:
                err = resp.json()
            except Exception:
                err = {"raw": resp.text}
            return {
                "ok": False,
                "model": model,
                "status_code": resp.status_code,
                "latency": latency,
                "error": err,
                "content": None,
            }

        data = resp.json()
        content = data["choices"][0]["message"]["content"]
        usage = data.get("usage", {})

        return {
            "ok": True,
            "model": model,
            "status_code": resp.status_code,
            "latency": latency,
            "content": content,
            "usage": usage,
        }

    except (httpx.TimeoutException, httpx.ConnectError) as e:
        latency = time.time() - start
        return {
            "ok": False,
            "model": model,
            "status_code": 0,
            "latency": latency,
            "error": str(e),
            "content": None,
        }
    except Exception as e:
        latency = time.time() - start
        return {
            "ok": False,
            "model": model,
            "status_code": 0,
            "latency": latency,
            "error": str(e),
            "content": None,
        }


async def call_openrouter_race(
    messages: List[Dict[str, str]],
    models: List[str] = None,
    global_timeout: float = 40.0,
) -> Dict[str, Any]:
    """
    Fire requests to multiple models in parallel and return the FIRST successful one.
    - models: list of model ids (defaults to FREE_MODELS).
    - global_timeout: overall timeout for the whole race.

    Returns dict: { ok, model, status_code, latency, content, usage }.
    Raises HTTPException if none succeed or global timeout occurs.
    """
    models = models or FREE_MODELS

    async with httpx.AsyncClient(timeout=global_timeout) as client:
        tasks = [
            asyncio.create_task(_call_single_model(client, m, messages))
            for m in models
        ]

        try:
            # as_completed yields tasks as they finish
            for completed in asyncio.as_completed(tasks, timeout=global_timeout):
                result = await completed
                if result.get("ok"):
                    # Cancel remaining tasks
                    for t in tasks:
                        if not t.done():
                            t.cancel()
                    return result

            # No successful result
            errors = []
            for t in tasks:
                try:
                    r = await t
                    errors.append(r)
                except asyncio.CancelledError:
                    pass

            raise HTTPException(
                status_code=502,
                detail={
                    "message": "All OpenRouter model calls failed.",
                    "errors": errors,
                },
            )

        except asyncio.TimeoutError:
            for t in tasks:
                if not t.done():
                    t.cancel()
            raise HTTPException(
                status_code=504,
                detail="Global timeout while waiting for OpenRouter models.",
            )
