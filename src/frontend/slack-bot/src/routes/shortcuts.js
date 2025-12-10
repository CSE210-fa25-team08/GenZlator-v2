// src/routes/shortcuts.js
const { buildFeedbackBlocks } = require("../views/feedback");
const { translate } = require("../utils/backendClient");
const { getChatHistory } = require("../utils/chatHistory");
const { addHistory } = require("../storage/history");
const { translateToEmojis, translateToWords } = require("../utils/translateFallback");
const { withTimeout } = require("../utils/withTimeout");

module.exports = function registerShortcuts(app) {
    app.shortcut("translate", async ({ ack, body, client }) => {
        await ack();
        const originalText = body.message?.text || "(no text)";
        const feedbackBlocks = buildFeedbackBlocks(originalText);

        let chatHistory = await getChatHistory(client, body.channel.id);

        let translated_1 = "";
        let translated_2 = "";
        try {
            translated_1 = await withTimeout(
                translate(originalText, true, chatHistory),
                3000, 
                "Translation backend timeout"
            );
            translated_2 = await withTimeout(
                translate(originalText, false, chatHistory),
                3000, 
                "Translation backend timeout"
            );
        } catch (err) {
            console.error("Translate backend error:", err);
            translated_1 = await translateToEmojis(originalText);
            translated_2 = await translateToWords(originalText);
        }

        addHistory(body.user.id, {
            original: originalText,
            translated: `\ntext to emoji : ${translated_1}\nemoji to text : ${translated_2}`,
            direction: "shortcut-translate", 
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
                    `• *Text → Emoji:* ${translated_1}\n` +
                    `• *Emoji → Text:* ${translated_2}\n`,
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