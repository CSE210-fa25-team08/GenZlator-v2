// src/routes/events.js
const { buildHomeView } = require("../utils/homeView");
const { getUserStyle } = require("../utils/style");

module.exports = function registerEvents(app) {
    // --- Event: App Home opened ---
    // When a user opens the App Home, publish a view to it
    app.event("app_home_opened", async ({ event, client }) => {
        const userId = event.user;
        const currentStyle = getUserStyle(userId);
        const view = buildHomeView(currentStyle);
        await client.views.publish({ user_id: userId, view });
    });
};