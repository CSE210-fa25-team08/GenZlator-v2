# GenZlator-v2: Emoji Translator Backend
This directory contains the FastAPI backend for the **Emoji Translator** project.  
It provides a bidirectional **English ↔ Emoji** translation API and a feedback endpoint.  
The backend uses **OpenRouter** and races multiple free models in parallel.

---

## 📁 Project Structure

```bash
src/backend/
  main.py                # App entrypoint (FastAPI)
  api/                   # HTTP routes
    translate.py         # /api/v1/translate
    feedback.py          # /api/v1/feedback
  core/                  # Shared models & clients
    models.py            # Pydantic schemas
    openrouter_client.py # OpenRouter chat/completions client (model race)
  vectorization/         # Embedding + RAG utilities
    embeddings_client.py # Embedding model calls
    feedback_rag.py      # RAG-style ranking for feedback
```

**main.py**  
- Creates the FastAPI application
- Includes the route modules under `/api/v1/...`
- Exposes /healthz for health checks

**core/models.py**  
- Defines request/response Pydantic models for Translation and Feedback

**core/openrouter_client.py**  
- Calls OpenRouter `/chat/completions` endpoint  
- Races multiple free models and returns the first successful result

**vectorization/embeddings_client.py & vectorization/feedback_rag.py**
- Reserved for feedback vectorization & RAG-style ranking
- These exist to support future features like "find similar feedback" or "search feedback by meaning," even if their code is not fully implemented yet

---

## ⚙️ Requirements

- Python 3.10+
- Dependencies:
  - fastapi  
  - uvicorn[standard]  
  - httpx  
  - pydantic  

Install manually:

```bash
pip install -r requirements.txt
````

---

## 🔧 Environment Variables

The backend uses:

| Variable             | Required | Description                             |
| -------------------- | -------- | --------------------------------------- |
| `OPENROUTER_API_KEY` | ✅ Yes    | OpenRouter API key for making LLM calls |
| `FEEDBACK_LOG_PATH`  | No       | Defaults to `feedback_log.jsonl`        |

Example:

```bash
export OPENROUTER_API_KEY="sk-or-..."
export FEEDBACK_LOG_PATH="feedback_log.jsonl"
```

---

## 🚀 Running the Server
Because the code uses `backend.*` imports, it’s best to run from the repo root with `src` on PYTHONPATH.

From the repo root:

```bash
cd src/backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at:
👉 [http://localhost:8000](http://localhost:8000)
Docs available at:
👉 [http://localhost:8000/docs](http://localhost:8000/docs)

If you prefer running from `src/backend`, make sure `PYTHONPATH` still points to src:

```bash
cd <repo-root>/src/backend
export PYTHONPATH=../..
export OPENROUTER_API_KEY="sk-or-..."
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 📡 API Endpoints

### 1. Health Check

**GET** `/healthz`

**Response:**

```json
{ "status": "ok" }
```

---

### 2. Translate

**POST** `/api/v1/translate`

Translates English → Emoji or Emoji → English depending on `isToEmoji`.

#### Translate Request Body

```json
{
  "originalMessage": "string",
  "isToEmoji": true,
  "chatHistory": ["optional", "context"]
}
```

#### Response Body

```json
{
  "translatedMessage": "string",
}
```

#### Example

In Linux/Ubuntu/Mac:

```bash
curl -X POST http://localhost:8000/api/v1/translate \
  -H "Content-Type: application/json" \
  -d '{
    "originalMessage": "That meeting was hilarious",
    "isToEmoji": true,
    "chatHistory": []
  }'
```
In Windows Terminal:

```bash
curl -X POST http://localhost:8000/api/v1/translate -H "Content-Type: application/json" -d "{ \"originalMessage\": \"That meeting was hilarious\",  \"isToEmoji\": true, \"chatHistory\": [] }"
```

---

### 3. Feedback

**POST** `/api/v1/feedback`

Used for logging corrections, ratings, and improvement hints.

#### Feedback Request Body

```json
{
  "originalInput": "🙂🙂🙂",
  "correctionText": "Very mildly amused",
  "anonymousId": "user-1234",
  "rating": 0
}
```

#### Response

```json
{ "status": "accepted" }
```

Logs are appended to `feedback_log.jsonl` (or your custom `FEEDBACK_LOG_PATH`).

---
