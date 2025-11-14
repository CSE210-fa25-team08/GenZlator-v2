# GenZlator-v2
Because sometimes ‘😭💀🔥’ says more than a paragraph — and GenZlator-v2 gets that

Test Endpoints:

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
