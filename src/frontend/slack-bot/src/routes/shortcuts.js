// src/routes/shortcuts.js
const { buildFeedbackBlocks } = require("../views/feedback");
const { translate } = require("../utils/backendClient");
const { getChatHistory } = require("../utils/chatHistory");
const { addHistory } = require("../storage/history");
const { translateToEmojis, translateToWords } = require("../utils/translateFallback");
const { withTimeout } = require("../utils/withTimeout");
const { getUserModel } = require("../utils/model");

module.exports = function registerShortcuts(app) {
    app.shortcut("translate", async ({ ack, body, client }) => {
        await ack();
        const originalText = body.message?.text || "(no text)";

        if (originalText.length > 1000) {
            await client.chat.postEphemeral({
                channel: body.channel.id,
                user: body.user.id,
                text: `❗ Your input is too long (${originalText.length} characters). Please keep it under 1000 characters.`,
            });
            return; 
        }

        const feedbackBlocks = buildFeedbackBlocks(originalText);

        let chatHistory = await getChatHistory(client, body.channel.id);
        let userModel = getUserModel(body.user.id);
        let translated = "";
        try {
            translated = await withTimeout(
                translate(originalText, true, chatHistory, userModel),
                3000, 
                "Translation backend timeout"
            );
        } catch (err) {
            console.error("Translate backend error:", err);
            translated = await translateToEmojis(originalText);
        }

        addHistory(body.user.id, {
            original: originalText,
            translated: translated,
            direction: "shortcut-translate-text-to-emoji", 
            timestamp: new Date().toISOString(),
            channel: body.channel.id
        });

        try {
            // Public channel → send translation to channel
            await client.chat.postMessage({
                channel: body.channel.id,
                text: `*🔅 Translation Result* ` +
                `*by:* <@${body.user.id}>\n` +
                    `• *Original Input:* ${originalText}\n` +
                    `• *Text → Emoji:* ${translated}\n`,
            });
    
            // Feedback (only visible to the user)
            await client.chat.postEphemeral({
                channel: body.channel.id,
                user: body.user.id,
                text: "Feedback on this translation",
                blocks: feedbackBlocks,
            });
    
        } catch (err) {
            // just figure out that slack can't done this 
            console.error(err);
        }
    });


    app.shortcut("translate_emoji", async ({ ack, body, client }) => {
        await ack();
        const originalText = body.message?.text || "(no text)";

        if (originalText.length > 1000) {
            await client.chat.postEphemeral({
                channel: body.channel.id,
                user: body.user.id,
                text: `❗ Your input is too long (${originalText.length} characters). Please keep it under 1000 characters.`,
            });
            return; 
        }

        const feedbackBlocks = buildFeedbackBlocks(originalText);

        let chatHistory = await getChatHistory(client, body.channel.id);
        let userModel = getUserModel(body.user.id);
        let translated = "";
        try {
            translated = await withTimeout(
                translate(originalText, false, chatHistory, userModel),
                3000, 
                "Translation backend timeout"
            );
        } catch (err) {
            console.error("Translate backend error:", err);
            translated = await translateToWords(originalText);
        }

        addHistory(body.user.id, {
            original: originalText,
            translated: translated,
            direction: "shortcut-translate-emoji-to-text", 
            timestamp: new Date().toISOString(),
            channel: body.channel.id
        });

        try {
            // Public channel → send translation to channel
            await client.chat.postMessage({
                channel: body.channel.id,
                text: `*🔅 Translation Result* ` +
                `*by:* <@${body.user.id}>\n` +
                    `• *Original Input:* ${originalText}\n` +
                    `• *Emoji → Text:* ${translated}\n`,
            });
    
            // Feedback (only visible to the user)
            await client.chat.postEphemeral({
                channel: body.channel.id,
                user: body.user.id,
                text: "Feedback on this translation",
                blocks: feedbackBlocks,
            });
    
        } catch (err) {
            // just figure out that slack can't done this 
            console.error(err);
        }
    });
};