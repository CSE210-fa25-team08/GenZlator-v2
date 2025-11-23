// src/routes/shortcuts.js
const { buildFeedbackBlocks } = require("../utils/feedback");

module.exports = function registerShortcuts(app) {
    // the shortcut ID is "translate_shortcut", and need to align with the one set in Slack App configuration
    
    app.shortcut("translate", async ({ ack, body, client }) => {
        await ack();
        const originalText = body.message?.text || "(no text)";

        const feedbackBlocks = buildFeedbackBlocks(originalText);

        await client.chat.postMessage({
            channel: body.channel.id,
            text: `Translated: "${originalText}" → DUMMY_OUTPUT`
        });

        await client.chat.postMessage({
            channel: body.channel.id,
            blocks: feedbackBlocks,
        });
    });
};