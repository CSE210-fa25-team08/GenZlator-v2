const axios = require("axios");

const API_BASE = 'https://genzlator-api.saichaparala.com';

async function translate(originalMessage, isToEmoji, chatHistory, modelId) {
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
  const resp = await axios.get(`${API_BASE}/api/v1/models`);
  //console.log("Available models from backend:", resp.data);
  return resp.data;
}

module.exports = { translate, sendFeedback, getAvailableModels };