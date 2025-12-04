// src/routes/events.js
const { renderHome } = require("../utils/renderHome");

module.exports = function registerEvents(app) {
    // --- Event: App Home opened ---
    // When a user opens the App Home, publish a view to it
    app.event("app_home_opened", async ({ event, client }) => {
        const userId = event.user;
        await renderHome(client, userId, "overview");
    });
};