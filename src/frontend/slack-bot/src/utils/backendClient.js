
const axios = require("axios");

const API_BASE = process.env.BACKEND_URL;

async function translate(originalMessage, isToEmoji) {
  console.log("🔗 Calling backend:", `${API_BASE}/api/v1/translate`);
  const resp = await axios.post(`${API_BASE}/api/v1/translate`, {
    originalMessage,
    isToEmoji,
    chatHistory: []
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

module.exports = { translate, sendFeedback };
