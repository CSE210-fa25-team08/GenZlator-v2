# src/backend/scripts/test_feedback_storage.py
import asyncio
import aiohttp
import time
import random
import string
import json
from typing import List, Dict
from dataclasses import dataclass
from datetime import datetime
import argparse

@dataclass
class FeedbackTestResult:
    success: bool
    response_time: float
    status_code: int
    feedback_id: str = None
    error: str = None

class FeedbackStorageTest:
    def __init__(self, base_url: str = "http://localhost:8001", batch_size: int = 10):
        self.base_url = base_url
        self.batch_size = batch_size
        self.results: List[FeedbackTestResult] = []
        
    def generate_random_string(self, length: int = None) -> str:
        """Generate a random alphanumeric string with no specific pattern"""
        if length is None:
            length = random.randint(5, 50)  # Random length 5-50
        
        # Generate a fully random combination of characters
        letters = string.ascii_letters + string.digits + ' '  # Includes upper/lowercase letters, digits, and space
        return ''.join(random.choice(letters) for _ in range(length))
    
    def generate_random_emoji_sequence(self) -> str:
        """Generate a random emoji sequence for originalInput"""
        emoji_pool = [
            '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
            '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
            '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸',
            '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣',
            '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
            '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
            '🔥', '💯', '✨', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🌟',
            '⭐', '💫', '💥', '💢', '💨', '💦', '💤', '🌈', '☀️', '⚡',
            '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
            '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'
        ]
        
        sequence_length = random.randint(1, 8)  # 1-8 emojis
        return ''.join(random.choice(emoji_pool) for _ in range(sequence_length))
    
    def generate_anonymous_id(self) -> str:
        """Generate an anonymous user ID"""
        prefix = "test-user-"
        suffix = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(8))
        return f"{prefix}{suffix}"
    
    async def send_feedback(self, session: aiohttp.ClientSession) -> FeedbackTestResult:
        """Send a single feedback request"""
        start_time = time.time()
        
        # Generate test data
        original_input = self.generate_random_emoji_sequence()
        correction_text = self.generate_random_string()
        anonymous_id = self.generate_anonymous_id()
        
        payload = {
            "originalInput": original_input,
            "correctionText": correction_text,
            "anonymousId": anonymous_id,
            "rating": 0  # Fixed to 0 as requested
        }
        
        try:
            async with session.post(
                f"{self.base_url}/api/v1/feedback",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                response_data = await response.json()
                response_time = time.time() - start_time
                
                return FeedbackTestResult(
                    success=response.status == 202,
                    response_time=response_time,
                    status_code=response.status,
                    feedback_id=response_data.get("id") if response.status == 202 else None,
                    error=response_data.get("detail") if response.status != 202 else None
                )
                
        except Exception as e:
            return FeedbackTestResult(
                success=False,
                response_time=time.time() - start_time,
                status_code=0,
                error=str(e)
            )
    
    async def run_batch_test(self, total_records: int = 100) -> Dict:
        """Run batch test"""
        print(f"🚀 Starting Feedback Storage Performance Test")
        print(f"   Target Records: {total_records}")
        print(f"   Batch Size: {self.batch_size}")
        print(f"   Base URL: {self.base_url}")
        print()
        
        connector = aiohttp.TCPConnector(limit=50, limit_per_host=20)
        async with aiohttp.ClientSession(connector=connector) as session:
            
            # Test start time
            overall_start = time.time()
            batches_completed = 0
            
            for i in range(0, total_records, self.batch_size):
                batch_start = time.time()
                current_batch_size = min(self.batch_size, total_records - i)
                
                # Create batch tasks
                tasks = [self.send_feedback(session) for _ in range(current_batch_size)]
                batch_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Handle results
                for result in batch_results:
                    if isinstance(result, Exception):
                        print(f"❌ Error in batch request: {result}", file=open('./feedback_storage_errors.log', 'a'))
                        self.results.append(FeedbackTestResult(
                            success=False,
                            response_time=0,
                            status_code=0,
                            error=str(result)
                        ))
                    else:
                        self.results.append(result)
                print(result, file=open('./feedback_storage_results.log', 'a'))
                batches_completed += 1
                batch_time = time.time() - batch_start
                
                # Real-time statistics
                successful_in_batch = sum(1 for r in batch_results if isinstance(r, FeedbackTestResult) and r.success)
                total_successful = sum(1 for r in self.results if r.success)
                
                print(f"📦 Batch {batches_completed}: {successful_in_batch}/{current_batch_size} successful, "
                      f"took {batch_time:.2f}s (avg {batch_time/current_batch_size:.3f}s per record)")
                print(f"📊 Overall Progress: {len(self.results)}/{total_records} "
                      f"({total_successful} successful, {len(self.results)-total_successful} failed)")
                
                # Add inter-batch delay to avoid overload
                if batches_completed * self.batch_size < total_records:
                    await asyncio.sleep(0.1)  # 100ms delay
        
        overall_time = time.time() - overall_start
        
        return {
            "total_time": overall_time,
            "total_records": len(self.results),
            "successful_records": sum(1 for r in self.results if r.success),
            "failed_records": sum(1 for r in self.results if not r.success),
            "records_per_second": len(self.results) / overall_time if overall_time > 0 else 0
        }
    
    def analyze_performance(self, test_summary: Dict):
        """Analyze performance results"""
        successful_results = [r for r in self.results if r.success]
        failed_results = [r for r in self.results if not r.success]
        
        print("\n" + "="*70)
        print("📈 FEEDBACK STORAGE PERFORMANCE ANALYSIS")
        print("="*70)
        
        # Basic statistics
        print(f"🎯 Test Summary:")
        print(f"   Total Records: {test_summary['total_records']}")
        print(f"   Successful: {test_summary['successful_records']} ({test_summary['successful_records']/test_summary['total_records']:.1%})")
        print(f"   Failed: {test_summary['failed_records']} ({test_summary['failed_records']/test_summary['total_records']:.1%})")
        print(f"   Total Time: {test_summary['total_time']:.2f} seconds")
        print(f"   Throughput: {test_summary['records_per_second']:.2f} records/second")
        
        if successful_results:
            response_times = [r.response_time for r in successful_results]
            avg_response = sum(response_times) / len(response_times)
            min_response = min(response_times)
            max_response = max(response_times)
            
            # Calculate percentiles
            sorted_times = sorted(response_times)
            p50 = sorted_times[int(len(sorted_times) * 0.5)]
            p95 = sorted_times[int(len(sorted_times) * 0.95)]
            p99 = sorted_times[int(len(sorted_times) * 0.99)]
            
            print(f"\n⏱️  Storage Performance (successful records):")
            print(f"   Average Response Time: {avg_response:.3f}s")
            print(f"   Min Response Time: {min_response:.3f}s")
            print(f"   Max Response Time: {max_response:.3f}s")
            print(f"   P50 (Median): {p50:.3f}s")
            print(f"   P95: {p95:.3f}s")
            print(f"   P99: {p99:.3f}s")
            
            # Database performance assessment
            if avg_response < 0.1:
                print(f"   🟢 Excellent database performance!")
            elif avg_response < 0.5:
                print(f"   🟡 Good database performance")
            else:
                print(f"   🔴 Database may need optimization")
        
        # Error analysis
        if failed_results:
            print(f"\n❌ Error Analysis:")
            error_counts = {}
            for result in failed_results:
                error_key = f"Status {result.status_code}: {result.error or 'Unknown'}"
                error_counts[error_key] = error_counts.get(error_key, 0) + 1
            
            for error_type, count in error_counts.items():
                print(f"   {error_type}: {count} occurrences")
        
        # Performance recommendations
        print(f"\n💡 Performance Recommendations:")
        if test_summary['records_per_second'] > 20:
            print(f"   ✅ High throughput achieved - database is performing well")
        elif test_summary['records_per_second'] > 10:
            print(f"   ⚠️  Moderate throughput - consider database indexing")
        else:
            print(f"   🔧 Low throughput - database optimization needed")
            
        if test_summary['failed_records'] > test_summary['total_records'] * 0.05:
            print(f"   🚨 High error rate - check database connections and constraints")

async def main():
    parser = argparse.ArgumentParser(description="Test feedback storage performance")
    parser.add_argument("--records", type=int, default=100, help="Number of feedback records to create")
    parser.add_argument("--batch-size", type=int, default=10, help="Batch size for concurrent requests")
    parser.add_argument("--url", type=str, default="http://localhost:8001", help="Base URL")
    
    args = parser.parse_args()
    
    # Validate arguments
    if args.records <= 0:
        print("❌ Records count must be positive")
        return
    
    if args.batch_size <= 0 or args.batch_size > 50:
        print("❌ Batch size must be between 1 and 50")
        return
    
    # Run test
    tester = FeedbackStorageTest(base_url=args.url, batch_size=args.batch_size)
    
    try:
        test_summary = await tester.run_batch_test(total_records=args.records)
        tester.analyze_performance(test_summary)
        
    except KeyboardInterrupt:
        print("\n🛑 Test interrupted by user")
        if tester.results:
            print(f"Partial results: {len(tester.results)} records processed")
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())