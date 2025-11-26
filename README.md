# GenZlator-v2
Because sometimes ‘😭💀🔥’ says more than a paragraph — and GenZlator-v2 gets that

## Backend Server (FastAPI)

The backend for the Emoji Translator is located in `src/backend` and provides:

- `POST /api/v1/translate` — English ↔ Emoji translation  
- `POST /api/v1/feedback` — Store corrections & ratings  
- `GET /healthz` — Health check

It uses OpenRouter and races multiple free LLMs to return the fastest valid response.

### Requirements

- Python 3.10+
- `OPENROUTER_API_KEY` environment variable

### Running the Backend

```bash
cd src/backend

# (optional) create virtual env
python -m venv .venv
source .venv/bin/activate

pip install fastapi uvicorn[standard] httpx pydantic python-dotenv

export OPENROUTER_API_KEY="sk-or-..."
export FEEDBACK_LOG_PATH="feedback_log.jsonl"   # optional

uvicorn main:app --reload --host 0.0.0.0 --port 8000
````

### Useful URLs

* API Root: [http://localhost:8000](http://localhost:8000)
* Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Example Call

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
```

```bash
curl -X POST "http://localhost:8000/api/v1/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "originalInput": "😄✨🎉",
    "correctionText": "I’m extremely happy today!",
    "anonymousId": "user-abc-123",
    "rating": 4
  }'
```