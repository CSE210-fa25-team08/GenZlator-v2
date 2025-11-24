// src/routes/shortcuts.js
const { buildFeedbackBlocks } = require("../utils/feedback");
const { translate } = require("../utils/backendClient");
const { getLastTwoMessages } = require("../utils/chatHistory");

module.exports = function registerShortcuts(app) {
    // the shortcut ID is "translate_shortcut", and need to align with the one set in Slack App configuration
    
    app.shortcut("translate", async ({ ack, body, client }) => {
        await ack();
        const originalText = body.message?.text || "(no text)";

        const feedbackBlocks = buildFeedbackBlocks(originalText);

        let chatHistory = await getLastTwoMessages(client, body);

        let translated = "model failed so dummy text";
            try {
                // translated = await translate(originalText, true, chatHistory);  
            } catch (err) {
                console.error("Translate backend error:", err);
                translated = "⚠️ Translation failed. Please try again later.";
        }

        try {
            // Public channel → send translation to channel
            await client.chat.postMessage({
                channel: body.channel.id,
                text: `Translated: "${originalText}" → ${translated}`,
            });
    
            // Feedback (only visible to the user)
            await client.chat.postEphemeral({
                channel: body.channel.id,
                user: body.user.id,
                text: "Feedback on this translation",
                blocks: feedbackBlocks,
            });
    
        } catch (err) {
            // DM or errors → fallback to ephemeral
            if (err.data?.error === "channel_not_found") {
                await client.chat.postEphemeral({
                    channel: body.user.id,     // DM fallback: ephemeral inside user's DM
                    user: body.user.id,
                    text: `Translated: "${originalText}" → ${translated}`,
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: `Translated: "${originalText}" → ${translated}`,
                            },
                        },
                        ...feedbackBlocks,
                    ]
                });
            } else {
                console.error(err);
            }
        }
    });
};