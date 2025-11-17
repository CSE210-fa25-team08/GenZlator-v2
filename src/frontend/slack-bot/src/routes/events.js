// src/routes/events.js
const { buildHomeView } = require("../utils/homeView");
const { getUserModel } = require("../utils/model");

module.exports = function registerEvents(app) {
    // --- Event: App Home opened ---
    // When a user opens the App Home, publish a view to it
    app.event("app_home_opened", async ({ event, client }) => {
        const userId = event.user;
        const currentModel = getUserModel(userId);
        const view = buildHomeView(currentModel);
        await client.views.publish({ user_id: userId, view });
    });
};