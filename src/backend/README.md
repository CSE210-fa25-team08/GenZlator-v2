# GenZlator-v2: Emoji Translator Backend

Because sometimes ‘😭💀🔥’ says more than a paragraph — and GenZlator-v2 gets that

This directory contains the FastAPI backend for the **Emoji Translator** project.  
It provides a bidirectional **English ↔ Emoji** translation API and a feedback endpoint.  
The backend uses **OpenRouter** and races multiple free models in parallel.

---

## 📁 Project Structure

src/backend/
main.py               # FastAPI app + endpoints
models.py             # Pydantic schemas for requests/responses
openrouter_client.py  # OpenRouter client with model 
```

**main.py**  
- Hosts the FastAPI application  
- Exposes `/api/v1/translate`, `/api/v1/feedback`, `/healthz`

**models.py**  
- Defines request/response Pydantic models

**openrouter_client.py**  
- Calls OpenRouter  
- Races multiple free models and returns the first successful result

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

From the repo root:

```bash
cd src/backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at:
👉 [http://localhost:8000](http://localhost:8000)
Docs available at:
👉 [http://localhost:8000/docs](http://localhost:8000/docs)


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
  "metadata": {
    "tone": "Neutral"
  }
}
```

#### Example

```bash
curl -X POST http://localhost:8000/api/v1/translate \
  -H "Content-Type: application/json" \
  -d '{
    "originalMessage": "That meeting was hilarious",
    "isToEmoji": true,
    "chatHistory": []
  }'
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
  "rating": 4
}
```

#### Response

```json
{ "status": "accepted" }
```

Logs are appended to `feedback_log.jsonl` (or your custom `FEEDBACK_LOG_PATH`).

---
