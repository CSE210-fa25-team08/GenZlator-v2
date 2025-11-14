# GenZlator-v2
Because sometimes ‘😭💀🔥’ says more than a paragraph — and GenZlator-v2 gets that

Export the Open Router API key:
export OPENROUTER_API_KEY="sk-or-v1-..."

Run the code using:
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

In a different terminal:

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


curl -X POST "http://localhost:8000/api/v1/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "originalInput": "😄✨🎉",
    "correctionText": "I’m extremely happy today!",
    "anonymousId": "user-abc-123",
    "rating": 4
  }'
