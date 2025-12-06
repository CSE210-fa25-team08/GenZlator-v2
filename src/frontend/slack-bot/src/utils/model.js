// for /api/v1/models compatibility
const { getAvailableModels } = require("./backendClient");

// fallback if API fails
let modelMap = {
  default: "mistral-7b-instruct",   
};

let modelInfo = {};

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

        // const first = data.models[0];
        // if (first) {
        //     const firstId = first.id.includes(":") ? first.id.split(":")[0] : first.id;
        //     newMap.default = firstId;
        // }

        Object.keys(modelInfo).forEach(k => delete modelInfo[k]);
        Object.assign(modelInfo, newInfo);

        Object.keys(modelMap).forEach(k => delete modelMap[k]);
        Object.assign(modelMap, newMap);
        // console.log("[Model] Loaded models:", modelMap);
        // console.log("[ModelInfo] Loaded:", modelInfo);

    } catch (err) {
        console.error("Failed to load models from API:", err);
    }
}


function getUserModel(userId) {
  return userDefaultModels[userId] || "default";
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
};