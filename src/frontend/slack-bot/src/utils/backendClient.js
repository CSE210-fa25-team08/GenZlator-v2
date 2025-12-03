
const axios = require("axios");

// const API_BASE = 'http://genzlator-api.saichaparala.com:8001';
const API_BASE = 'http://0.0.0.0:8001';

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

module.exports = { translate, sendFeedback };