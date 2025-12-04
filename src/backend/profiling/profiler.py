# benchmark/load_test.py
import asyncio
import aiohttp
import time
import random
import json
from typing import List, Dict, Any
from dataclasses import dataclass
from datetime import datetime
import argparse


@dataclass
class TestResult:
    success: bool
    response_time: float
    status_code: int
    error: str = None


class LoadTester:
    def __init__(self, base_url: str = "http://localhost:8001", target_qps: int = 3):
        self.base_url = base_url
        self.target_qps = target_qps
        self.interval = 1.0 / target_qps
        self.results: List[TestResult] = []

    async def make_request(
        self,
        session: aiohttp.ClientSession,
        endpoint: str,
        method: str = "GET",
        data: Dict = None,
    ) -> TestResult:
        """Make a single HTTP request and measure response time"""
        start_time = time.time()

        try:
            url = f"{self.base_url}{endpoint}"

            if method.upper() == "POST":
                async with session.post(url, json=data) as response:
                    await response.json()
                    return TestResult(
                        success=response.status == 200,
                        response_time=time.time() - start_time,
                        status_code=response.status,
                    )
            else:
                async with session.get(url) as response:
                    await response.json()
                    return TestResult(
                        success=response.status == 200,
                        response_time=time.time() - start_time,
                        status_code=response.status,
                    )

        except Exception as e:
            return TestResult(
                success=False,
                response_time=time.time() - start_time,
                status_code=0,
                error=str(e),
            )

    def get_test_scenarios(self) -> List[Dict]:
        """Define different test scenarios"""
        scenarios = [
            {
                "name": "translate_text_to_emoji",
                "endpoint": "/api/v1/translate",
                "method": "POST",
                "data": {
                    "originalMessage": random.choice(
                        [
                            "I am so happy today!",
                            "This is amazing!",
                            "I love this app",
                            "Great job everyone",
                            "Feeling sad today",
                            "This is confusing",
                        ]
                    ),
                    "isToEmoji": True,
                    "chatHistory": [],
                },
                "weight": 60,
            },
            {
                "name": "translate_emoji_to_text",
                "endpoint": "/api/v1/translate",
                "method": "POST",
                "data": {
                    "originalMessage": random.choice(
                        ["😊😄🎉", "😭😢💔", "🔥💯✨", "❤️💕😍", "😴💤😪", "🤔💭❓"]
                    ),
                    "isToEmoji": False,
                    "chatHistory": [],
                },
                "weight": 25,
            },
            {
                "name": "health_check",
                "endpoint": "/healthz",
                "method": "GET",
                "data": None,
                "weight": 5,
            },
            {
                "name": "get_models",
                "endpoint": "/api/v1/models",
                "method": "GET",
                "data": None,
                "weight": 5,
            },
            # Debug API
            {
                "name": "debug_rag",
                "endpoint": "/debug/rag",
                "method": "GET",
                "data": None,
                "weight": 5,
            },
        ]
        return scenarios

    def select_scenario(self, scenarios: List[Dict]) -> Dict:
        """Randomly select a test scenario based on weights"""
        total_weight = sum(s["weight"] for s in scenarios)
        random_num = random.randint(1, total_weight)

        current_weight = 0
        for scenario in scenarios:
            current_weight += scenario["weight"]
            if random_num <= current_weight:
                return scenario

        return scenarios[0]  # fallback

    async def run_load_test(self, duration_seconds: int = 60):
        """Run load test for specified duration"""
        print(f"🚀 Starting load test:")
        print(f"   Target QPS: {self.target_qps}")
        print(f"   Duration: {duration_seconds} seconds")
        print(f"   Base URL: {self.base_url}")
        print(f"   Request interval: {self.interval:.3f}s")
        print()

        scenarios = self.get_test_scenarios()
        start_time = time.time()
        request_count = 0

        async with aiohttp.ClientSession() as session:
            while time.time() - start_time < duration_seconds:
                request_start = time.time()

                scenario = self.select_scenario(scenarios)

                result = await self.make_request(
                    session, scenario["endpoint"], scenario["method"], scenario["data"]
                )

                self.results.append(result)
                request_count += 1

                if request_count % 50 == 0:
                    success_rate = sum(
                        1 for r in self.results[-50:] if r.success
                    ) / min(50, len(self.results))
                    avg_response_time = sum(
                        r.response_time for r in self.results[-50:]
                    ) / min(50, len(self.results))
                    print(
                        f"📊 Requests: {request_count}, Success Rate: {success_rate:.1%}, Avg Response: {avg_response_time:.3f}s"
                    )

                elapsed = time.time() - request_start
                sleep_time = max(0, self.interval - elapsed)
                if sleep_time > 0:
                    await asyncio.sleep(sleep_time)

        await self.print_results()

    async def print_results(self):
        """Print detailed test results"""
        if not self.results:
            print("❌ No results to analyze")
            return

        total_requests = len(self.results)
        successful_requests = sum(1 for r in self.results if r.success)
        failed_requests = total_requests - successful_requests

        response_times = [r.response_time for r in self.results if r.success]

        print("\n" + "=" * 60)
        print("📈 LOAD TEST RESULTS")
        print("=" * 60)
        print(f"Total Requests: {total_requests}")
        print(
            f"Successful: {successful_requests} ({successful_requests/total_requests:.1%})"
        )
        print(f"Failed: {failed_requests} ({failed_requests/total_requests:.1%})")

        if response_times:
            avg_response = sum(response_times) / len(response_times)
            min_response = min(response_times)
            max_response = max(response_times)

            sorted_times = sorted(response_times)
            p50 = sorted_times[int(len(sorted_times) * 0.5)]
            p95 = sorted_times[int(len(sorted_times) * 0.95)]
            p99 = sorted_times[int(len(sorted_times) * 0.99)]

            print(f"\n⏱️  Response Times:")
            print(f"   Average: {avg_response:.3f}s")
            print(f"   Min: {min_response:.3f}s")
            print(f"   Max: {max_response:.3f}s")
            print(f"   P50: {p50:.3f}s")
            print(f"   P95: {p95:.3f}s")
            print(f"   P99: {p99:.3f}s")

        # Error analysis
        errors = [r for r in self.results if not r.success]
        if errors:
            print(f"\n❌ Error Analysis:")
            error_counts = {}
            for error in errors:
                key = f"Status {error.status_code}: {error.error or 'Unknown'}"
                error_counts[key] = error_counts.get(key, 0) + 1

            for error_type, count in error_counts.items():
                print(f"   {error_type}: {count}")


async def main():
    parser = argparse.ArgumentParser(description="Load test for GenZlator-v2 API")
    parser.add_argument(
        "--qps", type=int, default=10, help="Target queries per second (5-40)"
    )
    parser.add_argument(
        "--duration", type=int, default=60, help="Test duration in seconds"
    )
    parser.add_argument(
        "--url", type=str, default="http://localhost:8001", help="Base URL"
    )

    args = parser.parse_args()

    if not (5 <= args.qps <= 40):
        print("⚠️  Warning: QPS should be between 5-40 for realistic testing")

    tester = LoadTester(base_url=args.url, target_qps=args.qps)
    await tester.run_load_test(duration_seconds=args.duration)


if __name__ == "__main__":
    asyncio.run(main())
