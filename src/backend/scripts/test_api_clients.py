import asyncio
import time
import statistics
from typing import List, Dict, Any
from fastapi import HTTPException

# Import existing clients
from backend.core.openai_client import call_openai_race
from backend.core.gemini_client import call_gemini_race

# Configuration
ITERATIONS = 25
TEST_MESSAGES = [
    {"role": "user", "content": "Generate a random 5-word sentence."}
]

def calculate_stats(latencies: List[float], errors: int, total: int) -> Dict[str, Any]:
    if not latencies:
        return {
            "success_rate": "0%",
            "avg_latency": "N/A",
            "min_latency": "N/A",
            "max_latency": "N/A",
            "p95_latency": "N/A",
            "errors": errors
        }

    return {
        "success_rate": f"{((total - errors) / total) * 100:.1f}%",
        "avg_latency": f"{statistics.mean(latencies):.4f}s",
        "min_latency": f"{min(latencies):.4f}s",
        "max_latency": f"{max(latencies):.4f}s",
        "p95_latency": f"{statistics.quantiles(latencies, n=20)[-1]:.4f}s" if len(latencies) > 1 else "N/A",
        "errors": errors
    }

async def run_stress_test(name: str, race_func, iterations: int):
    print(f"\n--- Starting Benchmark: {name} ---")
    print(f"Target: {iterations} iterations | Payload: {TEST_MESSAGES[0]['content']}")
    
    latencies = []
    errors = 0
    
    start_time = time.time()

    for i in range(iterations):
        iter_start = time.time()
        try:
            # We add a tiny sleep to prevent immediate local resource exhaustion
            # and to separate the races slightly.
            await asyncio.sleep(0.05) 
            
            print(f"[{name}] Call {i+1}/{iterations}...", end=" ", flush=True)
            
            # Call the race function
            result = await race_func(messages=TEST_MESSAGES)
            
            # Extract latency provided by your client logic
            latency = result.get('latency', 0.0)
            latencies.append(latency)
            
            # Identify which specific model/instance won (for debug)
            winner = result.get('model') or result.get('instance_id')
            print(f"Success ({latency:.3f}s) - Winner: {winner}")

        except HTTPException as e:
            print(f"FAILED (HTTP {e.status_code})")
            errors += 1
        except Exception as e:
            print(f"FAILED (Error: {str(e)})")
            errors += 1

    total_time = time.time() - start_time
    stats = calculate_stats(latencies, errors, iterations)
    
    return {
        "name": name,
        "total_wall_time": total_time,
        "stats": stats
    }

async def main():
    print(f"Initialize Stress Test for {ITERATIONS} calls each.")
    
    # Run OpenAI Test
    openai_results = await run_stress_test("OpenAI Race", call_openai_race, ITERATIONS)
    
    # Run Gemini Test
    gemini_results = await run_stress_test("Gemini Race", call_gemini_race, ITERATIONS)

    # Print Final Report
    print("\n" + "="*60)
    print(f"{'METRIC':<20} | {'OPENAI RACE':<18} | {'GEMINI RACE':<18}")
    print("="*60)
    
    stats_o = openai_results["stats"]
    stats_g = gemini_results["stats"]
    
    metrics = [
        ("Success Rate", stats_o["success_rate"], stats_g["success_rate"]),
        ("Avg Latency", stats_o["avg_latency"], stats_g["avg_latency"]),
        ("P95 Latency", stats_o["p95_latency"], stats_g["p95_latency"]),
        ("Min Latency", stats_o["min_latency"], stats_g["min_latency"]),
        ("Max Latency", stats_o["max_latency"], stats_g["max_latency"]),
        ("Total Errors", stats_o["errors"], stats_g["errors"]),
    ]

    for label, val_o, val_g in metrics:
        print(f"{label:<20} | {str(val_o):<18} | {str(val_g):<18}")
    
    print("="*60)
    print(f"Total Wall Time (OpenAI): {openai_results['total_wall_time']:.2f}s")
    print(f"Total Wall Time (Gemini): {gemini_results['total_wall_time']:.2f}s")

if __name__ == "__main__":
    asyncio.run(main())