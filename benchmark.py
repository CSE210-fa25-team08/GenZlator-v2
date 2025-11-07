import time
import json
import os
from datetime import datetime
from typing import Dict, List, Tuple
import requests

class OpenRouterBenchmark:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.results = []
        
        if not self.api_key:
            raise ValueError(
                "OpenRouter API key not found. Please set OPENROUTER_API_KEY environment variable "
                "or pass it to the constructor."
            )
    
    def check_api_connection(self) -> bool:
        """Check if API key is valid"""
        try:
            response = requests.get(
                f"{self.base_url}/models",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                }
            )
            if response.status_code == 200:
                return True
            else:
                print(f"❌ API returned status code: {response.status_code}")
                if response.status_code == 401:
                    print("   Invalid API key. Get one at: https://openrouter.ai/keys")
                return False
        except Exception as e:
            print(f"❌ Error connecting to OpenRouter: {e}")
            return False
    
    def call_openrouter(self, model: str, prompt: str, system_prompt: str = "") -> Tuple[str, float, int, Dict]:
        """Call OpenRouter API and return response with timing and metadata"""
        start_time = time.time()
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://github.com/yourusername/llm-benchmark",
                    "X-Title": "LLM Emoji Benchmark"
                },
                json={
                    "model": model,
                    "messages": messages,
                },
                timeout=60
            )
            
            end_time = time.time()
            latency = end_time - start_time
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                
                # Extract usage information
                usage = result.get('usage', {})
                metadata = {
                    'prompt_tokens': usage.get('prompt_tokens', 0),
                    'completion_tokens': usage.get('completion_tokens', 0),
                    'total_tokens': usage.get('total_tokens', 0)
                }
                
                return content, latency, 200, metadata
            else:
                error_msg = f"HTTP {response.status_code}"
                try:
                    error_detail = response.json()
                    if 'error' in error_detail:
                        error_msg += f": {error_detail['error'].get('message', str(error_detail['error']))}"
                except:
                    error_msg += f": {response.text}"
                return error_msg, latency, response.status_code, {}
                
        except requests.exceptions.Timeout:
            end_time = time.time()
            return "Timeout (>60s)", end_time - start_time, 408, {}
        except requests.exceptions.ConnectionError:
            end_time = time.time()
            return "Connection Error", end_time - start_time, 0, {}
        except Exception as e:
            end_time = time.time()
            return f"Error: {str(e)}", end_time - start_time, 0, {}
    
    def test_emoji_to_text(self, model: str, emojis: str) -> Dict:
        """Test emoji to text translation"""
        system_prompt = "You are an expert at translating emojis to text. Provide clear, concise translations."
        prompt = f"Translate these emojis to text: {emojis}"
        
        response, latency, status_code, metadata = self.call_openrouter(model, prompt, system_prompt)
        
        return {
            "model": model,
            "test_type": "emoji_to_text",
            "input": emojis,
            "output": response,
            "latency_seconds": round(latency, 3),
            "status_code": status_code,
            "success": status_code == 200,
            "tokens": metadata,
            "timestamp": datetime.now().isoformat()
        }
    
    def test_text_to_emoji(self, model: str, text: str) -> Dict:
        """Test text to emoji translation"""
        system_prompt = "You are an expert at translating text to emojis. Provide relevant emoji representations."
        prompt = f"Convert this text to emojis: {text}"
        
        response, latency, status_code, metadata = self.call_openrouter(model, prompt, system_prompt)
        
        return {
            "model": model,
            "test_type": "text_to_emoji",
            "input": text,
            "output": response,
            "latency_seconds": round(latency, 3),
            "status_code": status_code,
            "success": status_code == 200,
            "tokens": metadata,
            "timestamp": datetime.now().isoformat()
        }
    
    def run_benchmark(self, models: List[str], test_cases: Dict[str, List[str]]):
        """Run benchmark on all models with all test cases"""
        print("=" * 80)
        print("OPENROUTER LLM EMOJI TRANSLATION BENCHMARK")
        print("=" * 80)
        print(f"Testing {len(models)} models with {len(test_cases['emoji_to_text']) + len(test_cases['text_to_emoji'])} test cases")
        print("=" * 80)
        print()
        
        for model in models:
            print(f"\n{'='*80}")
            print(f"Testing Model: {model}")
            print(f"{'='*80}")
            
            # Test emoji to text
            print(f"\n--- Emoji to Text Tests ---")
            for emoji in test_cases['emoji_to_text']:
                result = self.test_emoji_to_text(model, emoji)
                self.results.append(result)
                
                status_icon = "✅" if result['success'] else "❌"
                print(f"\n{status_icon} Input:   {emoji}")
                if result['success']:
                    output_display = result['output'][:100] + "..." if len(result['output']) > 100 else result['output']
                    print(f"   Output:  {output_display}")
                    print(f"   Tokens:  {result['tokens'].get('total_tokens', 'N/A')}")
                else:
                    print(f"   Error:   {result['output']}")
                print(f"   Latency: {result['latency_seconds']}s")
            
            # Test text to emoji
            print(f"\n--- Text to Emoji Tests ---")
            for text in test_cases['text_to_emoji']:
                result = self.test_text_to_emoji(model, text)
                self.results.append(result)
                
                status_icon = "✅" if result['success'] else "❌"
                print(f"\n{status_icon} Input:   {text}")
                if result['success']:
                    output_display = result['output'][:100] + "..." if len(result['output']) > 100 else result['output']
                    print(f"   Output:  {output_display}")
                    print(f"   Tokens:  {result['tokens'].get('total_tokens', 'N/A')}")
                else:
                    print(f"   Error:   {result['output']}")
                print(f"   Latency: {result['latency_seconds']}s")
            
            # Calculate statistics for this model
            model_results = [r for r in self.results if r['model'] == model]
            successful_results = [r for r in model_results if r['success']]
            
            if successful_results:
                avg_latency = sum(r['latency_seconds'] for r in successful_results) / len(successful_results)
                total_tokens = sum(r['tokens'].get('total_tokens', 0) for r in successful_results)
                success_rate = len(successful_results) / len(model_results) * 100
                print(f"\n{'─'*80}")
                print(f"Model Statistics:")
                print(f"  Average Latency: {avg_latency:.3f}s")
                print(f"  Success Rate: {success_rate:.1f}% ({len(successful_results)}/{len(model_results)})")
                print(f"  Total Tokens Used: {total_tokens}")
                print(f"{'─'*80}")
            else:
                print(f"\n{'─'*80}")
                print(f"⚠️  All tests failed for {model}")
                print(f"{'─'*80}")
            
            # Small delay between models to avoid rate limiting
            time.sleep(1)
    
    def generate_summary(self):
        """Generate summary statistics with cost estimates"""
        print(f"\n\n{'='*80}")
        print("BENCHMARK SUMMARY")
        print(f"{'='*80}\n")
        
        # Model pricing (per million tokens) - Updated with current OpenRouter prices
        pricing = {
            # FREE models
            "mistralai/mistral-7b-instruct:free": 0.0,
            "deepseek/deepseek-r1:free": 0.0,
            "deepseek/deepseek-r1-distill-llama-70b:free": 0.0,
            "cognitivecomputations/dolphin3.0-mistral-24b:free": 0.0,
            "cognitivecomputations/dolphin-mistral-24b-venice-edition:free": 0.0,
            
            # Ultra low-cost models ($0.018 - $0.08)
            "meta-llama/llama-3.2-3b-instruct": 0.018,
            "google/gemma-2-9b-it": 0.03,
            "mistralai/mistral-7b-instruct-v0.3": 0.03,
            "mistralai/mistral-nemo": 0.04,
            "meta-llama/llama-3.1-8b-instruct": 0.06,
            
            # Low-cost advanced models ($0.08 - $0.30)
            "qwen/qwen-2.5-coder-32b-instruct": 0.08,
            "mistralai/mistral-small-3.1": 0.10,
            "google/gemini-flash-1.5-8b": 0.0375,
            "qwen/qwen-2.5-72b-instruct": 0.23,
            "meta-llama/llama-3.1-70b-instruct": 0.30,
        }
        
        # Group by model
        models = list(set(r['model'] for r in self.results))
        
        summary_data = []
        for model in models:
            model_results = [r for r in self.results if r['model'] == model]
            successful_results = [r for r in model_results if r['success']]
            
            if not successful_results:
                summary_data.append({
                    'model': model,
                    'avg_latency': 0,
                    'min_latency': 0,
                    'max_latency': 0,
                    'success_rate': 0,
                    'total_tokens': 0,
                    'estimated_cost': 0,
                    'successful_tests': 0,
                    'total_tests': len(model_results)
                })
                continue
            
            avg_latency = sum(r['latency_seconds'] for r in successful_results) / len(successful_results)
            min_latency = min(r['latency_seconds'] for r in successful_results)
            max_latency = max(r['latency_seconds'] for r in successful_results)
            success_rate = len(successful_results) / len(model_results) * 100
            total_tokens = sum(r['tokens'].get('total_tokens', 0) for r in successful_results)
            
            # Estimate cost
            price_per_million = pricing.get(model, 0.05)  # Default to $0.05 if unknown
            estimated_cost = (total_tokens / 1_000_000) * price_per_million
            
            summary_data.append({
                'model': model,
                'avg_latency': avg_latency,
                'min_latency': min_latency,
                'max_latency': max_latency,
                'success_rate': success_rate,
                'total_tokens': total_tokens,
                'estimated_cost': estimated_cost,
                'successful_tests': len(successful_results),
                'total_tests': len(model_results)
            })
        
        # Sort by success rate first, then average latency
        summary_data.sort(key=lambda x: (-x['success_rate'], x['avg_latency']))
        
        # Print table
        print(f"{'Model':<45} {'Success':<10} {'Avg Lat':<10} {'Tokens':<10} {'Est Cost':<10}")
        print(f"{'─'*45} {'─'*10} {'─'*10} {'─'*10} {'─'*10}")
        
        for data in summary_data:
            model_short = data['model'].split('/')[-1] if '/' in data['model'] else data['model']
            if data['success_rate'] > 0:
                cost_display = f"${data['estimated_cost']:.4f}" if data['estimated_cost'] > 0 else "FREE"
                print(f"{model_short:<45} {data['success_rate']:>6.1f}%   {data['avg_latency']:>7.3f}s  {data['total_tokens']:>8}   {cost_display:<10}")
            else:
                print(f"{model_short:<45} {data['success_rate']:>6.1f}%   {'FAILED':<10} {'N/A':<10} {'N/A':<10}")
        
        # Find winner
        winners = [d for d in summary_data if d['success_rate'] == 100]
        if winners:
            winner = winners[0]
            model_short = winner['model'].split('/')[-1] if '/' in winner['model'] else winner['model']
            print(f"\n{'='*80}")
            print(f"🏆 WINNER: {model_short}")
            print(f"   Success Rate: {winner['success_rate']:.1f}%")
            print(f"   Average Latency: {winner['avg_latency']:.3f}s")
            print(f"   Total Tokens: {winner['total_tokens']}")
            cost_display = f"${winner['estimated_cost']:.4f}" if winner['estimated_cost'] > 0 else "FREE"
            print(f"   Estimated Cost: {cost_display}")
            print(f"{'='*80}\n")
        else:
            print(f"\n{'='*80}")
            print(f"⚠️  No model completed all tests successfully")
            print(f"{'='*80}\n")
        
        return summary_data
    
    def save_results(self, filename: str = "openrouter_benchmark_results.json"):
        """Save results to JSON file"""
        with open(filename, 'w') as f:
            json.dump({
                'results': self.results,
                'timestamp': datetime.now().isoformat(),
                'total_tests': len(self.results),
                'successful_tests': len([r for r in self.results if r['success']])
            }, f, indent=2)
        print(f"💾 Results saved to {filename}")


def main():
    print("\n🔍 Initializing OpenRouter Benchmark...")
    
    # Check for API key
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("\n❌ OPENROUTER_API_KEY not found in environment variables!")
        print("\nTo get started:")
        print("1. Sign up at: https://openrouter.ai/")
        print("2. Get your API key at: https://openrouter.ai/keys")
        print("3. Set environment variable:")
        print("   export OPENROUTER_API_KEY='your-api-key-here'")
        print("\nOr pass the API key directly to the script.")
        return
    
    try:
        benchmark = OpenRouterBenchmark(api_key)
    except ValueError as e:
        print(f"❌ {e}")
        return
    
    # Check connection
    print("🔌 Testing API connection...")
    if not benchmark.check_api_connection():
        return
    
    print("✅ Connected to OpenRouter!\n")
    
    # Low-cost and FREE open-source models on OpenRouter
    models = [
        # === FREE MODELS (No cost) ===
        "mistralai/mistral-7b-instruct:free",                     # Mistral 7B (FREE) ✓ Working
        "deepseek/deepseek-r1:free",                              # DeepSeek R1 671B (FREE) - Reasoning model
        "deepseek/deepseek-r1-distill-llama-70b:free",           # DeepSeek R1 Distilled 70B (FREE)
        "cognitivecomputations/dolphin3.0-mistral-24b:free",     # Dolphin 3.0 24B (FREE)
        "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",  # Venice Uncensored (FREE)
        
        # === ULTRA LOW-COST MODELS ($0.018 - $0.08 per 1M tokens) ===
        "meta-llama/llama-3.2-3b-instruct",                       # Llama 3.2 3B - $0.018/1M tokens (40% cheaper!)
        "google/gemma-2-9b-it",                                   # Gemma 2 9B - $0.03/1M tokens (50% cheaper!)
        "mistralai/mistral-7b-instruct-v0.3",                     # Mistral 7B v0.3 - $0.03/1M tokens (50% cheaper!)
        "mistralai/mistral-nemo",                                 # Mistral Nemo 12B - $0.04/1M tokens (70% cheaper!)
        "meta-llama/llama-3.1-8b-instruct",                       # Llama 3.1 8B - $0.06/1M tokens
        
        # === LOW-COST ADVANCED MODELS ($0.08 - $0.30 per 1M tokens) ===
        "qwen/qwen-2.5-coder-32b-instruct",                       # Qwen 2.5 Coder 32B - $0.08/1M tokens
        "mistralai/mistral-small-3.1",                            # Mistral Small 3.1 24B - $0.10/1M tokens
        "google/gemini-flash-1.5-8b",                             # Gemini Flash 8B - $0.0375/1M tokens
        "qwen/qwen-2.5-72b-instruct",                             # Qwen 2.5 72B - $0.23/1M tokens (40% cheaper!)
        "meta-llama/llama-3.1-70b-instruct",                      # Llama 3.1 70B - $0.30/1M tokens
    ]
    
    # Test cases
    test_cases = {
        'emoji_to_text': [
            "🍕😍🔥",
            "❄️🏔️⛷️",
            "💻🚀🌟",
        ],
        'text_to_emoji': [
            "I love eating pizza",
            "Going skiing in the mountains",
            "Excited about this new tech project",
        ]
    }
    
    print(f"🚀 Starting benchmark with {len(models)} models...")
    print(f"   • {sum(1 for m in models if ':free' in m)} FREE models")
    print(f"   • {len(models) - sum(1 for m in models if ':free' in m)} low-cost models")
    print(f"   Total tests per model: {len(test_cases['emoji_to_text']) + len(test_cases['text_to_emoji'])}")
    print(f"\n💡 Note: This benchmark will test 15 models. Estimated time: 5-10 minutes")
    print(f"   Estimated total cost for paid models: $0.01 - $0.05")
    print()
    
    input("Press Enter to start (or Ctrl+C to cancel)...")
    
    # Run benchmark
    start_time = time.time()
    benchmark.run_benchmark(models, test_cases)
    total_time = time.time() - start_time
    
    # Generate summary
    summary = benchmark.generate_summary()
    
    # Save results
    benchmark.save_results()
    
    print(f"\n✅ Benchmark complete! Total time: {total_time:.1f}s")
    print(f"📊 Results saved to: openrouter_benchmark_results.json")


if __name__ == "__main__":
    main()