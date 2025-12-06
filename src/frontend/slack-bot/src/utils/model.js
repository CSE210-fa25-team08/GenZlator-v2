// for /api/v1/models compatibility
const { getAvailableModels } = require("./backendClient");

// fallback if API fails
let modelMap = {};

let modelInfo = {};

let defaultModelId = "default";

// simple in-memory store for user default models
const userDefaultModels = {};

async function loadModelsFromAPI() {
    try {
        const data = await getAvailableModels();
        const newMap = {};
        const newInfo = {};

        data.models.forEach(m => {
      const modelId = m.id.split(":")[0];

      // create simplified key (used by your app)
      const key = m.name.toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "");

        newMap[key] = modelId;

        // store complete metadata for home view
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

        Object.keys(modelInfo).forEach(k => delete modelInfo[k]);
        Object.assign(modelInfo, newInfo);

        Object.keys(modelMap).forEach(k => delete modelMap[k]);
        Object.assign(modelMap, newMap);

        const keys = Object.keys(newMap);
        if (keys.length > 0) {
            defaultModelId = keys[0];
            console.log("Set default model ID to:", defaultModelId);
        }
        // console.log("[Model] Loaded models:", modelMap);
        // console.log("[ModelInfo] Loaded:", modelInfo);

    } catch (err) {
        console.error("Failed to load models from API:", err);
    }
}


function getUserModel(userId) {
  console.log("HI" + defaultModelId);
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