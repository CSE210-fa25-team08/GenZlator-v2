import os
import time
import asyncio
from typing import Dict, Any, List, Optional
import httpx
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()
# Gemini Configuration
GEMINI_MODEL = "gemini-2.5-flash" 
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

# Number of identical requests to fire in parallel
PARALLEL_INSTANCE_COUNT = 5


def _get_api_key() -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not set in the environment.",
        )
    return api_key


def _convert_openai_messages_to_gemini(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Helper to convert OpenAI format [{"role": "user", ...}] 
    to Gemini REST format {"contents": [...], "system_instruction": ...}
    """
    system_instruction = None
    contents = []

    for msg in messages:
        role = msg.get("role")
        content = msg.get("content", "")

        if role == "system":
            system_instruction = {
                "parts": [{"text": content}]
            }
        elif role == "user":
            contents.append({
                "role": "user",
                "parts": [{"text": content}]
            })
        elif role == "assistant":
            contents.append({
                "role": "model",
                "parts": [{"text": content}]
            })

    payload = {"contents": contents}
    if system_instruction:
        payload["system_instruction"] = system_instruction
    
    return payload


async def _call_single_gemini_instance(
    client: httpx.AsyncClient,
    instance_id: int,
    payload: Dict[str, Any],
    api_key: str,
    request_timeout: float = 30.0,
) -> Dict[str, Any]:
    """
    Call a single instance of Gemini.
    instance_id is just for logging/debugging which 'racer' won.
    """
    start = time.time()
    url = f"{GEMINI_BASE_URL}/{GEMINI_MODEL}:generateContent?key={api_key}"

    try:
        resp = await client.post(
            url,
            headers={"Content-Type": "application/json"},
            json=payload,
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
                "instance_id": instance_id,
                "status_code": resp.status_code,
                "latency": latency,
                "error": err,
                "content": None,
            }

        data = resp.json()
        
        # Parse Gemini Response Structure
        try:
            # Gemini returns candidates -> content -> parts -> text
            content_text = data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError):
            return {
                "ok": False,
                "instance_id": instance_id,
                "status_code": 200, # Technically success HTTP but failed parsing
                "latency": latency,
                "error": "Failed to parse Gemini response structure",
                "content": None,
            }

        # Extract Usage (token counts)
        usage = data.get("usageMetadata", {})

        return {
            "ok": True,
            "instance_id": instance_id,
            "status_code": resp.status_code,
            "latency": latency,
            "content": content_text,
            "usage": usage,
        }

    except (httpx.TimeoutException, httpx.ConnectError) as e:
        latency = time.time() - start
        return {
            "ok": False,
            "instance_id": instance_id,
            "status_code": 0,
            "latency": latency,
            "error": str(e),
            "content": None,
        }
    except Exception as e:
        latency = time.time() - start
        return {
            "ok": False,
            "instance_id": instance_id,
            "status_code": 0,
            "latency": latency,
            "error": str(e),
            "content": None,
        }


async def call_gemini_race(
    messages: List[Dict[str, str]],
    global_timeout: float = 40.0,
) -> Dict[str, Any]:
    """
    Fires 5 parallel requests to the same Gemini endpoint.
    Returns the FIRST successful response.
    """
    api_key = _get_api_key()
    gemini_payload = _convert_openai_messages_to_gemini(messages)

    async with httpx.AsyncClient(timeout=global_timeout) as client:
        # Create 5 identical tasks
        tasks = [
            asyncio.create_task(
                _call_single_gemini_instance(client, i, gemini_payload, api_key)
            ) 
            for i in range(PARALLEL_INSTANCE_COUNT)
        ]

        try:
            # as_completed yields tasks as they finish
            for completed in asyncio.as_completed(tasks, timeout=global_timeout):
                result = await completed
                
                if result.get("ok"):
                    # We have a winner!
                    # Cancel remaining tasks to save bandwidth/processing
                    for t in tasks:
                        if not t.done():
                            t.cancel()
                    
                    # Return the winner
                    return {
                        "model": GEMINI_MODEL,
                        "winner_instance": result["instance_id"], # Debug info
                        "content": result["content"],
                        "latency": result["latency"],
                        "usage": result["usage"],
                    }

            # If we exit the loop, no task succeeded
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
                    "message": "All parallel Gemini calls failed.",
                    "errors": errors,
                },
            )

        except asyncio.TimeoutError:
            for t in tasks:
                if not t.done():
                    t.cancel()
            raise HTTPException(
                status_code=504,
                detail="Global timeout while waiting for Gemini race.",
            )
        
# TESTING CODE

# async def main():
#     messages = [
#         {"role": "system", "content": "Can you hear me?"},
#         {"role": "user", "content": "What's the capital of France?"}
#     ]

#     print("Running Gemini model race...")
#     result = await call_gemini_race(messages)

#     print("\n--- WINNER ---")
#     print("Model:", result["model"])
#     print("Latency:", f"{result['latency']:.4f}s")
#     print("Content:", result["content"])

# if __name__ == "__main__":
#     asyncio.run(main())
