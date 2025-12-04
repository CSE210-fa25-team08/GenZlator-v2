import os
import time
import json
import asyncio
from typing import Dict, Any, List

import httpx
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

# OpenAI Base URL
OPENAI_BASE_URL = "https://api.openai.com/v1"

# 5 Light OpenAI models to race
# Note: OpenAI treats specific version tags (e.g., -0125) as distinct model targets
LIGHT_MODELS = [
    "gpt-4o-mini",
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-0125",
    "gpt-3.5-turbo-1106",
    "gpt-4o-mini-2024-07-18",
]

def _get_headers() -> Dict[str, str]:
    """
    Standard OpenAI headers.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is not set in the environment.",
        )

    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


async def _call_single_model(
    client: httpx.AsyncClient,
    model: str,
    messages: List[Dict[str, str]],
    i: int = 0
) -> Dict[str, Any]:
    """
    Call a single OpenAI model and return timing + content.
    Designed to be used inside asyncio tasks (for racing).
    """
    start = time.time()
    try:
        # OpenAI usually handles connections fast, but we keep the timeout logic
        # We don't need the i%2 logic here unless you are rotating multiple OpenAI keys
        
        resp = await client.post(
            f"{OPENAI_BASE_URL}/chat/completions",
            headers=_get_headers(),
            json={"model": model, "messages": messages},
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


async def call_openai_race(
    messages: List[Dict[str, str]],
    models: List[str] = None,
    global_timeout: float = 30.0, # Reduced timeout as OpenAI is generally faster/stricter
) -> Dict[str, Any]:
    """
    Fire requests to multiple OpenAI models in parallel and return the FIRST successful one.
    - models: list of model ids (defaults to LIGHT_MODELS).
    - global_timeout: overall timeout for the whole race.

    Returns dict: { ok, model, status_code, latency, content, usage }.
    Raises HTTPException if none succeed or global timeout occurs.
    """
    models = models or LIGHT_MODELS

    # We use a single client instance for connection pooling efficiency, 
    # but we launch 5 concurrent tasks.
    async with httpx.AsyncClient(timeout=global_timeout) as client:
        tasks = [
            asyncio.create_task(_call_single_model(client, m, messages, i)) 
            for i, m in enumerate(models)
        ]

        try:
            # as_completed yields tasks as they finish
            for completed in asyncio.as_completed(tasks, timeout=global_timeout):
                result = await completed
                if result.get("ok"):
                    # Cancel remaining tasks to save tokens/resources
                    for t in tasks:
                        if not t.done():
                            t.cancel()
                    return result

            # No successful result after all tasks finished
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
                    "message": "All OpenAI model calls failed.",
                    "errors": errors,
                },
            )

        except asyncio.TimeoutError:
            for t in tasks:
                if not t.done():
                    t.cancel()
            raise HTTPException(
                status_code=504,
                detail="Global timeout while waiting for OpenAI models.",
            )


async def main():
    messages = [
        {"role": "system", "content": "Can you hear me?"},
        {"role": "user", "content": "What's the capital of France?"}
    ]

    print("Running OpenAI model race...")
    # Note: Updated function name to match provider
    result = await call_openai_race(messages)

    print("\n--- WINNER ---")
    print("Model:", result["model"])
    print("Latency:", f"{result['latency']:.4f}s")
    print("Content:", result["content"])

if __name__ == "__main__":
    asyncio.run(main())