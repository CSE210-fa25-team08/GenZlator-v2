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
    scenario_name: str = None


class LoadTester:
    def __init__(self, base_url: str = "http://localhost:8001", target_qps: int = 10):
        self.base_url = base_url
        self.target_qps = target_qps
        self.results: List[TestResult] = []
        self.request_times: List[float] = []  # 记录请求发送时间

    async def make_request(
        self,
        session: aiohttp.ClientSession,
        endpoint: str,
        method: str = "GET",
        data: Dict = None,
        scenario_name: str = None,
        timeout: int = 30,
    ) -> TestResult:
        """Make a single HTTP request and measure response time"""
        start_time = time.time()

        try:
            url = f"{self.base_url}{endpoint}"

            # 设置超时，避免请求无限等待
            timeout_obj = aiohttp.ClientTimeout(total=timeout)

            if method.upper() == "POST":
                async with session.post(
                    url, json=data, timeout=timeout_obj
                ) as response:
                    await response.json()
                    return TestResult(
                        success=response.status == 200,
                        response_time=time.time() - start_time,
                        status_code=response.status,
                        scenario_name=scenario_name,
                    )
            else:
                async with session.get(url, timeout=timeout_obj) as response:
                    await response.json()
                    return TestResult(
                        success=response.status == 200,
                        response_time=time.time() - start_time,
                        status_code=response.status,
                        scenario_name=scenario_name,
                    )

        except asyncio.TimeoutError:
            return TestResult(
                success=False,
                response_time=time.time() - start_time,
                status_code=0,
                error=f"Timeout after {timeout}s",
                scenario_name=scenario_name,
            )
        except Exception as e:
            return TestResult(
                success=False,
                response_time=time.time() - start_time,
                status_code=0,
                error=str(e),
                scenario_name=scenario_name,
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

        return scenarios[0]

    async def request_generator(
        self,
        session: aiohttp.ClientSession,
        scenarios: List[Dict],
        duration_seconds: int,
    ):
        """
        生成请求任务，控制QPS速率
        按照目标QPS的速率生成任务，不等待响应
        """
        start_time = time.time()
        request_count = 0

        while time.time() - start_time < duration_seconds:
            # 计算应该在这个时刻发送的请求总数
            elapsed = time.time() - start_time
            expected_count = int(elapsed * self.target_qps)

            # 发送缺少的请求
            while request_count < expected_count:
                scenario = self.select_scenario(scenarios)

                task = asyncio.create_task(
                    self.make_request(
                        session,
                        scenario["endpoint"],
                        scenario["method"],
                        scenario["data"],
                        scenario_name=scenario["name"],
                    )
                )

                # 将任务与回调关联
                task.add_done_callback(self._handle_result)

                self.request_times.append(time.time())
                request_count += 1

                # 短暂睡眠，避免 CPU 过度消耗
                await asyncio.sleep(0.001)

            # 每 100ms 检查一次是否需要发送更多请求
            await asyncio.sleep(0.1)

    def _handle_result(self, task: asyncio.Task):
        """处理单个请求的结果"""
        try:
            result = task.result()
            self.results.append(result)
        except Exception as e:
            self.results.append(
                TestResult(
                    success=False,
                    response_time=0,
                    status_code=0,
                    error=str(e),
                    scenario_name="unknown",
                )
            )

    async def run_load_test(self, duration_seconds: int = 60):
        """Run load test for specified duration"""
        print(f"🚀 Starting load test:")
        print(f"   Target QPS: {self.target_qps}")
        print(f"   Duration: {duration_seconds} seconds")
        print(f"   Base URL: {self.base_url}")
        print(f"   Expected requests: ~{self.target_qps * duration_seconds}")
        print()

        scenarios = self.get_test_scenarios()
        start_time = time.time()

        async with aiohttp.ClientSession() as session:
            # 启动请求生成器（控制QPS）
            generator_task = asyncio.create_task(
                self.request_generator(session, scenarios, duration_seconds)
            )

            # 定期打印进度
            last_report_time = start_time
            while (
                time.time() - start_time < duration_seconds + 5
            ):  # 额外等待5秒让请求完成
                current_time = time.time()
                if current_time - last_report_time >= 10:  # 每10秒报告一次
                    elapsed = current_time - start_time
                    sent_requests = len(self.request_times)
                    completed_requests = len(self.results)

                    print(
                        f"📊 Elapsed: {elapsed:.1f}s | Sent: {sent_requests} | "
                        f"Completed: {completed_requests} | Pending: {sent_requests - completed_requests}"
                    )
                    last_report_time = current_time

                await asyncio.sleep(1)

                # 如果生成器任务完成且所有请求都已完成，则退出
                if generator_task.done() and len(self.request_times) == len(
                    self.results
                ):
                    break

            # 等待所有未完成的请求
            pending_tasks = asyncio.all_tasks()
            if pending_tasks:
                print(
                    f"\n⏳ Waiting for {len(pending_tasks)} pending requests to complete..."
                )
                await asyncio.gather(*pending_tasks, return_exceptions=True)

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

        print("\n" + "=" * 70)
        print("📈 LOAD TEST RESULTS")
        print("=" * 70)
        print(f"Total Requests Sent: {len(self.request_times)}")
        print(f"Total Responses: {total_requests}")
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

            print(f"\n⏱️  Response Times (successful requests):")
            print(f"   Average: {avg_response:.3f}s")
            print(f"   Min: {min_response:.3f}s")
            print(f"   Max: {max_response:.3f}s")
            print(f"   P50 (median): {p50:.3f}s")
            print(f"   P95: {p95:.3f}s")
            print(f"   P99: {p99:.3f}s")

        # 按场景分析
        print(f"\n📋 Results by Scenario:")
        scenario_stats = {}
        for result in self.results:
            scenario = result.scenario_name or "unknown"
            if scenario not in scenario_stats:
                scenario_stats[scenario] = {"success": 0, "failed": 0, "times": []}

            if result.success:
                scenario_stats[scenario]["success"] += 1
                scenario_stats[scenario]["times"].append(result.response_time)
            else:
                scenario_stats[scenario]["failed"] += 1

        for scenario, stats in scenario_stats.items():
            total = stats["success"] + stats["failed"]
            success_rate = stats["success"] / total if total > 0 else 0
            avg_time = (
                sum(stats["times"]) / len(stats["times"]) if stats["times"] else 0
            )
            print(
                f"   {scenario}: {stats['success']}/{total} "
                f"({success_rate:.1%}) - Avg: {avg_time:.3f}s"
            )

        # 错误分析
        errors = [r for r in self.results if not r.success]
        if errors:
            print(f"\n❌ Error Analysis:")
            error_counts = {}
            for error in errors:
                key = f"Status {error.status_code}: {error.error or 'Unknown'}"
                error_counts[key] = error_counts.get(key, 0) + 1

            for error_type, count in error_counts.items():
                print(f"   {error_type}: {count}")

        print("\n" + "=" * 70)


async def main():
    parser = argparse.ArgumentParser(description="Load test for GenZlator-v2 API")
    parser.add_argument(
        "--qps", type=int, default=10, help="Target queries per second (5-100)"
    )
    parser.add_argument(
        "--duration", type=int, default=60, help="Test duration in seconds"
    )
    parser.add_argument(
        "--url", type=str, default="http://localhost:8001", help="Base URL"
    )

    args = parser.parse_args()

    if not (1 <= args.qps <= 100):
        print("⚠️  Warning: QPS should be between 1-100")

    tester = LoadTester(base_url=args.url, target_qps=args.qps)
    await tester.run_load_test(duration_seconds=args.duration)


if __name__ == "__main__":
    asyncio.run(main())
