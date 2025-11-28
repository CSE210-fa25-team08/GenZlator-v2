# GenZlator-v2

Because sometimes '😭💀🔥' says more than a paragraph — and GenZlator-v2 gets that

## Code Structure

```text
GenZlator-v2/
├── src/backend/                     # FASTAPI BACKEND APPLICATION
│   ├── api/                         # API ROUTE HANDLERS
│   │   ├── __init__.py             # Router package initialization
│   │   ├── debug_router.py         # Debug endpoints for RAG system inspection and testing
│   │   ├── feedback_router.py      # Feedback collection API for user corrections and ratings
│   │   ├── health_check_router.py  # Health check endpoints for system monitoring
│   │   ├── models_router.py        # Model information and configuration API
│   │   └── translation_router.py   # Main translation API (text ↔ emoji conversion)
│   ├── core/                       # CORE BUSINESS LOGIC
│   │   ├── models.py               # Pydantic data models and request/response schemas
│   │   ├── openrouter_client.py    # OpenRouter API client with model racing capability
│   │   └── rag_lite.py            # RAG system for similarity search using sentence transformers and SQLite
│   ├── scripts/                    # PERFORMANCE TESTING AND DATABASE UTILITIES
│   │   ├── test_feedback_storage.py # Database storage performance testing script
│   │   └── test_query_performance.py # Database query performance testing script
│   ├── utils/                      # SHARED UTILITIES
│   │   └── prompt_manager.py       # Prompt templates and generation for LLM interactions
│   └── backend_main.py             # FastAPI application entry point
├── prompts/                        # LLM PROMPT TEMPLATES
│   └── prompts.json               # JSON file containing structured prompts for different translation scenarios
├── specs/                          # PROJECT SPECIFICATIONS
│   ├── pitch/                      # Project pitch materials
│   ├── BackendProposal.pdf         # Backend architecture proposal document
│   ├── FrontendProposal.pdf        # Frontend design proposal document
│   └── StartingPitchPresentation.pdf # Initial project presentation
└── README.md                       # PROJECT DOCUMENTATION - API examples, setup instructions, and endpoint reference
```

## Setup

Export the Open Router API key:

```bash
export OPENROUTER_API_KEY="sk-or-v1-..."
```

Run the backend server using:

```bash
uvicorn src.backend.backend_main:app --reload --host 0.0.0.0 --port 8001
```

And in another terminal, access the API with examples below.
After receiving feedback, the system will store it in a SQLite database named `feedback_embeddings.db` in the working directory, and store the logs in `feedback_log.jsonl`.

## Model Racing Architecture

GenZlator-v2 uses a **Model Racing System** for optimal performance:

- **Parallel Processing**: Simultaneous requests to multiple free-tier LLM models
- **First-Success Strategy**: Returns the first successful response for minimal latency
- **Fault Tolerance**: Multiple models provide redundancy and reliability
- **Current Models**: 5 free OpenRouter models including Mistral, DeepSeek, and Dolphin variants

## Public API Examples

### Translation API

```bash
curl -X POST "http://localhost:8001/api/v1/translate" \
  -H "Content-Type: application/json" \
  -d '{
    "originalMessage": "I am so happy today, everything feels amazing!",
    "isToEmoji": true,
    "chatHistory": [
      "How was your exam?",
      "It went really well!"
    ]
  }'

curl -X POST "http://localhost:8001/api/v1/translate" \
  -H "Content-Type: application/json" \
  -d '{
    "originalMessage": "I love apple",
    "isToEmoji": true,
    "chatHistory": [
      "Did you enjoy the party?",
      "Yes, it was fantastic!"
    ]
  }'
```

Or, with `Invoke-RestMethod`:

```powershell
Invoke-RestMethod -Uri "http://localhost:8001/api/v1/translate" -Method POST -ContentType "application/json" -Body '{
  "originalMessage": "I am so happy today, everything feels amazing!",
  "isToEmoji": true,
  "chatHistory": [
    "How was your exam?",
    "It went really well!"
  ]
}'
```

### Models API

Get information about available translation models:

```bash
# Get all available models
curl -X GET "http://localhost:8001/api/v1/models"

```

Or, with `Invoke-RestMethod`:

```powershell
# Get all available models
Invoke-RestMethod -Uri "http://localhost:8001/api/v1/models" -Method GET
```

### Feedback API

```bash
curl -X POST "http://localhost:8001/api/v1/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "originalInput": "😄✨🎉",
    "correctionText": "I'm extremely happy today!",
    "anonymousId": "user-abc-123",
    "rating": 0
  }'
```

Or, with `Invoke-RestMethod`:

```powershell
Invoke-RestMethod -Uri "http://localhost:8001/api/v1/feedback" -Method POST -ContentType "application/json" -Body '{
    "originalInput": "😄✨🎉",
    "correctionText": "I''m extremely happy today!",
    "anonymousId": "user-abc-123",
    "rating": 0
  }'
```

## Private API Examples (Not for public use)

### Health Check APIs

```bash
# Basic health check (fast, for load balancers)
curl -X GET "http://localhost:8001/healthz"
```

### Debug APIs

```bash
# Debug RAG system statistics and recent feedback
curl -X GET "http://localhost:8001/debug/rag"

# Debug RAG similarity search functionality
curl -X POST "http://localhost:8001/debug/rag/search" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "😭😭😭"
  }'
```

Or, with `Invoke-RestMethod`:

```powershell
# Debug RAG system statistics and recent feedback
Invoke-RestMethod -Uri "http://localhost:8001/debug/rag" -Method GET

# Debug RAG similarity search functionality
Invoke-RestMethod -Uri "http://localhost:8001/debug/rag/search" -Method POST -ContentType "application/json" -Body '{
    "text": "An apple a day"
  }'
```

### Root API

```bash
# Get API information and available endpoints
curl -X GET "http://localhost:8001/"
```

## Performance Testing & Database Management

GenZlator-v2 includes comprehensive testing scripts for performance evaluation and database management:

### Database Storage Performance Testing

Test feedback storage performance with large datasets:

```bash
# Install testing dependencies
pip install aiohttp

# Test with 1,000 records (moderate load)
python src/backend/scripts/test_feedback_storage.py --records 1000 --batch-size 20

# Test with 10,000 records (high load)
python src/backend/scripts/test_feedback_storage.py --records 10000 --batch-size 50

# Custom server testing
python src/backend/scripts/test_feedback_storage.py --records 5000 --batch-size 25 --url "http://your-server:8001"
```

**Test Features:**

- Generates random emoji sequences and correction text with rating=0
- Measures database storage throughput (records/second)
- Analyzes response time distribution (P50, P95, P99)
- Provides performance optimization recommendations

### Database Query Performance Testing

Test query performance with large datasets (10K+ records):

```bash
# Comprehensive query performance test
python src/backend/scripts/test_query_performance.py --stat-queries 30 --search-queries 100 --concurrent 10

# High-load testing
python src/backend/scripts/test_query_performance.py --stat-queries 50 --search-queries 200 --concurrent 15

# Custom configuration
python src/backend/scripts/test_query_performance.py --stat-queries 20 --search-queries 80 --concurrent 8 --url "http://localhost:8001"
```

**Test Features:**

- Tests RAG statistics queries (`GET /debug/rag`)
- Tests similarity search performance (`POST /debug/rag/search`)
- Evaluates query performance with large datasets
- Analyzes database optimization needs
- Measures concurrent query handling capability

### Performance Testing Workflow

1. **Generate Test Data:**

   ```bash
   # Create 50,000 test records for performance testing
   python src/backend/scripts/test_feedback_storage.py --records 50000 --batch-size 50
   ```

2. **Test Query Performance:**

   ```bash
   # Test query performance with the large dataset
   python src/backend/scripts/test_query_performance.py --search-queries 200 --concurrent 10
   ```

3. **Monitor Results:**
   - Storage throughput should exceed 10 records/second for good performance
   - Query response times should be under 0.5s for datasets with 50K+ records
   - Success rates should exceed 95% under normal load

### Load Testing Considerations

When testing with high QPS (Queries Per Second):

- **OpenRouter Rate Limits**: Free models typically allow 1-5 QPS
- **Model Racing Multiplier**: Each translation request sends 5 concurrent API calls
- **502 Bad Gateway Errors**: Common when exceeding rate limits
- **Recommended Testing**: Start with 1-3 QPS for realistic free-tier testing

## API Response Formats

### Translation Response

An example response for ``api/v1/translate`` is as follows:

```json
{
  "translatedMessage": "😊🎉✨",
  "metadata": {
    "tone": "Extreme Happiness"
  }
}
```

### Models Response

An example response for ``api/v1/models`` is as follows:

```json
{
  "models": [
    {
      "id": "mistralai/mistral-7b-instruct:free",
      "name": "Mistral 7B Instruct",
      "description": "Efficient instruction-following model, good for general tasks including translation",
      "is_free": true,
      "provider": "Mistral AI",
      "max_tokens": 4096,
      "strengths": ["Fast response", "Good instruction following", "Multilingual support"]
    },
    ...
  ],
  "total_count": 5
}
```

### Feedback Response

```json
{
  "id": "feedback-uuid-here",
  "status": "success",
  "message": "Feedback received and stored"
}
```

## Database Schema

The system uses SQLite databases for data persistence:

- **`feedback_embeddings.db`**: Stores user feedback and vector embeddings for RAG
- **`feedback_log.jsonl`**: JSON Lines format log of all feedback submissions

### Performance Characteristics

- **Storage**: 10-50 records/second depending on system load
- **Queries**: Sub-500ms response times for datasets up to 100K records
- **RAG Search**: Efficient similarity search using sentence transformers
- **Concurrent Handling**: Supports 5-15 concurrent requests effectively

## System Architecture

GenZlator-v2 employs a modern, scalable architecture:

1. **FastAPI Backend**: High-performance async web framework
2. **Model Racing**: Parallel LLM requests for optimal response times  
3. **RAG System**: Context-aware translation improvements using user feedback
4. **SQLite Storage**: Lightweight, embedded database for feedback and embeddings
5. **Sentence Transformers**: Vector similarity search for contextual translation
6. **OpenRouter Integration**: Access to multiple free LLM models via single API
