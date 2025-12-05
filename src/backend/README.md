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
│   │   └── test_feedback_storage.py # Database storage performance testing script
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
TODO: Add instructions for Gemini & OpenAI keys if needed.


Run the backend server using:

```bash
uvicorn src.backend.main:app --reload --host 0.0.0.0 --port 8000
```

And in another terminal, access the API with examples below.
After receiving feedback, the system will store it in a SQLite database named `feedback_embeddings.db` in the working directory, and store the logs in `feedback_log.jsonl`.


## Public API Examples

### Translation API

```bash
curl -X POST "http://localhost:8000/api/v1/translate" \
  -H "Content-Type: application/json" \
  -d '{
    "originalMessage": "I am so happy today, everything feels amazing!",
    "isToEmoji": true,
    "chatHistory": [
      "How was your exam?",
      "It went really well!"
    ]
  }'

curl -X POST "http://localhost:8000/api/v1/translate" \
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
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/translate" -Method POST -ContentType "application/json" -Body '{
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
curl -X GET "http://localhost:8000/api/v1/models"

```

Or, with `Invoke-RestMethod`:

```powershell
# Get all available models
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/models" -Method GET
```

### Feedback API

```bash
curl -X POST "http://localhost:8000/api/v1/feedback" \
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
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/feedback" -Method POST -ContentType "application/json" -Body '{
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
curl -X GET "http://localhost:8000/healthz"
```

### Debug APIs

```bash
# Debug RAG system statistics and recent feedback
curl -X GET "http://localhost:8000/debug/rag"

# Debug RAG similarity search functionality
curl -X POST "http://localhost:8000/debug/rag/search" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "😭😭😭"
  }'
```

Or, with `Invoke-RestMethod`:

```powershell
# Debug RAG system statistics and recent feedback
Invoke-RestMethod -Uri "http://localhost:8000/debug/rag" -Method GET

# Debug RAG similarity search functionality
Invoke-RestMethod -Uri "http://localhost:8000/debug/rag/search" -Method POST -ContentType "application/json" -Body '{
    "text": "An apple a day"
  }'
```

### Root API

```bash
# Get API information and available endpoints
curl -X GET "http://localhost:8000/"
```

### Performance Testing & Database Management

GenZlator-v2 includes comprehensive testing scripts for performance evaluation and database management:

#### profiling

Test the qps with the script:

```bash
python src/backend/profiling/profiler.py --qps 10 --duration 10 --url "http://your-server:8000"

```

### Database Storage Performance Testing

Test feedback storage performance with large datasets:

```bash
# Install testing dependencies
pip install aiohttp


# Custom server testing
python src/backend/scripts/test_feedback_storage.py --records 5000 --batch-size 25 --url "http://your-server:8000"
```

**Test Features:**

- Generates random emoji sequences and correction text with rating=0
- Measures database storage throughput (records/second)
- Analyzes response time distribution (P50, P95, P99)
- Provides performance optimization recommendations
