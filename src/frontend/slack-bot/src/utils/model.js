// for /api/v1/models compatibility
const { getAvailableModels } = require("./backendClient");

// fallback if API fails
let modelMap = {};
let modelInfo = {};

let defaultModelId = "gpt4omini";

// simple in-memory store for user default models
const userDefaultModels = {};

async function loadModelsFromAPI() {
    try {
        const data = await getAvailableModels();
        const newMap = {};
        const newInfo = {};

        data.models.forEach(m => {
            // backend now provides `model_id` (no colon)
            const modelId = m.model_id;

            // simplified key (same rule as before)
            const key = m.name.toLowerCase()
                .replace(/\s+/g, "")
                .replace(/[^a-z0-9]/g, "");

            // map simplified key → actual model_id
            newMap[key] = modelId;

            // store metadata
            newInfo[modelId] = {
                id: modelId,
                name: m.name,
                description: m.description,
                provider: m.provider,
                max_tokens: m.max_tokens,
                strengths: m.strengths,
                is_free: m.is_free
            };
        });

        // reset and replace
        Object.keys(modelInfo).forEach(k => delete modelInfo[k]);
        Object.assign(modelInfo, newInfo);

        Object.keys(modelMap).forEach(k => delete modelMap[k]);
        Object.assign(modelMap, newMap);

        // set default model to the first available key
        const keys = Object.keys(newMap);
        if (keys.length > 0) {
            defaultModelId = keys[0];
            console.log("Set default model ID to:", defaultModelId);
        }

        // console.log("[Model] Loaded models:", modelMap);
        // console.log("[ModelInfo] Loaded:", modelInfo);

    } catch (err) {
        console.error("Failed to load models from API:", err);
        Object.keys(modelInfo).forEach(k => delete modelInfo[k]);
        Object.keys(modelMap).forEach(k => delete modelMap[k]);
        defaultModelId = "gpt4omini";
    }
}


function getUserModel(userId) {
  return userDefaultModels[userId] || defaultModelId;
}

function setUserModel(userId, key) {
  userDefaultModels[userId] = key;
}

module.exports = {
  modelMap,
  modelInfo,   
  loadModelsFromAPI,
  getUserModel,
  setUserModel,
  defaultModelId
};