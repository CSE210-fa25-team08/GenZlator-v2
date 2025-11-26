// for /api/v1/models compatibility

const modelMap = {
  default: "mistral-7b-instruct",
  deepseekR1: "deepseek-r1",
  deepseekR1Distill: "deepseek-r1-distill-llama-70b",
  dolphin3: "dolphin3.0-mistral-24b",
  dolphin: "dolphin-mistral-24b-venice-edition"
};

// simple in-memory store for user default models
const userDefaultModels = {};


function getUserModel(userId) {
  return userDefaultModels[userId] || "default";
}

function setUserModel(userId, model) {
  userDefaultModels[userId] = model;
}

module.exports = {
  modelMap,
  getUserModel,
  setUserModel,
};