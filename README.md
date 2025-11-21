# GenZlator-v2
Because sometimes '😭💀🔥' says more than a paragraph — and GenZlator-v2 gets that

## Code Structure 
```
GenZlator-v2/
├── backend/                          # FASTAPI BACKEND APPLICATION
│   ├── core/                         # CORE BUSINESS LOGIC
│   │   └── rag_lite.py              # RAG system for similarity search using sentence transformers and SQLite
│   └── routers/                      # API ROUTE HANDLERS
│       ├── __init__.py              # Router package initialization
│       ├── debug_router.py          # Debug endpoints for RAG system inspection and testing
│       ├── feedback_router.py       # Feedback collection API for user corrections and ratings
│       ├── health_check_router.py   # Health check endpoints for system monitoring
│       └── translation_router.py    # Main translation API (text ↔ emoji conversion)
├── utils/                           # SHARED UTILITIES
│   ├── prompt_manager.py            # Prompt templates and generation for LLM interactions
├── prompts/                        # LLM PROMPT TEMPLATES
│   └── prompts.json                # JSON file containing structured prompts for different translation scenarios
├── specs/                          # PROJECT SPECIFICATIONS
│   ├── pitch/                      # Project pitch materials
│   ├── BackendProposal.pdf         # Backend architecture proposal document
│   ├── FrontendProposal.pdf        # Frontend design proposal document
│   └── StartingPitchPresentation.pdf # Initial project presentation
├── benchmark.py                    # PERFORMANCE TESTING SCRIPT - Tests multiple LLM models on emoji translation tasks
├── openrouter_client.py           # OPENROUTER API CLIENT - Handles async requests to multiple LLM models with racing
├── __init__.py                    # Package initialization file
└── README.md                      # PROJECT DOCUMENTATION - API examples, setup instructions, and endpoint reference
```

## Setup
Export the Open Router API key:
```bash
export OPENROUTER_API_KEY="sk-or-v1-..."
```

Run the code using:
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8001

```

And in another terminal, access the API with examples below. 
After receiving the feedback, the system will store the feedback in a SQLite database named `feedback_embeddings.db` in the working directory, and store the logs in `feedback_log.jsonl`.





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

### Root API
```bash
# Get API information and available endpoints
curl -X GET "http://localhost:8001/"
```
