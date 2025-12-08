const axios = require("axios");

const API_BASE = 'http://genzlator-api.saichaparala.com:8001';

async function translate(originalMessage, isToEmoji, chatHistory) {
  console.log("Calling backend:", `${API_BASE}/api/v1/translate`);
  const resp = await axios.post(`${API_BASE}/api/v1/translate`, {
    originalMessage,
    isToEmoji,
    chatHistory: chatHistory || []
  });
  return resp.data.translatedMessage;
}

async function sendFeedback(originalInput, correctionText, anonymousId, rating) {
  const resp = await axios.post(`${API_BASE}/api/v1/feedback`, {
    originalInput,
    correctionText,
    anonymousId,
    rating
  });
  return resp.data;
}

async function getAvailableModels() {
  // const resp = await axios.get(`${API_BASE}/api/v1/models`);
  // return resp.data;
  let temp = {
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
    ],
    "total_count": 5
  };
  return temp;
}

module.exports = { translate, sendFeedback, getAvailableModels };