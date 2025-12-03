// src/routes/commands.js
const { buildFeedbackBlocks } = require("../utils/feedback");
const { modelMap } = require("../utils/model");
const { openTranslateModal } = require("../utils/commandTranslate");
const { translate } = require("../utils/backendClient");
const { getChatHistory } = require("../utils/chatHistory");
const { addHistory, getHistory } = require("../storage/history");


// currently, the response can be viewed by all members in the channel
// future work: if in a public channel, add setting to make response visible to only the command user

module.exports = function registerCommands(app) {
    // --- /text-to-emoji ---
    app.command("/text-to-emoji", async ({ command, ack, respond, client }) => {
        await ack();
        const text = command.text.trim();
    
        if (text) {
            let chatHistory = await getChatHistory(client, command.channel_id);

            console.log("Sending to backend:", {
                originalMessage: text,
                isToEmoji: true,
                chatHistory
            });

            let translated = "";
            try {
                translated = await translate(text, true, chatHistory);  
            } catch (err) {
                console.error("Translate backend error:", err);
                translated = "Translation failed. Please try again later.";
            }
    
            const feedbackBlocks = buildFeedbackBlocks(text);

            addHistory(command.user_id, {
                original: text,
                translated: translated,
                direction: "text-to-emoji", 
                timestamp: new Date().toISOString(),
                channel: command.channel_id
            });
    
            try {
                // Public channel → send translation to channel
                await client.chat.postMessage({
                    channel: command.channel_id,
                    response_type: "in_channel",
                    text: `*🔅 Translation Result*\n\n` +
                    `• *Original Text:* ${text}\n` +
                    `• *Text → Emoji:* ${translated}\n`,    
                });
    
                // Feedback (only visible to the user)
                await client.chat.postEphemeral({
                    channel: command.channel_id,
                    user: command.user_id,
                    text: "Feedback on this translation",
                    blocks: feedbackBlocks,
                });
    
            } catch (err) {
                // DM or errors → fallback to ephemeral
                if (err.data?.error === "channel_not_found") {
                    await respond({
                        response_type: "ephemeral",
                        replace_original: false,
                        blocks: [
                            {
                                type: "section",
                                text: {
                                    type: "mrkdwn",
                                    text: `*🔅 Translation Result*\n\n` +
                    `• *Original Text:* ${text}\n` +
                    `• *Text → Emoji:* ${translated}\n`,
                                },
                            },
                            ...feedbackBlocks,
                        ],
                    });
                } else {
                    console.error(err);
                }
            }
    
        } else {
            // If no text → open the modal
            await openTranslateModal(
                client,
                command.trigger_id,
                command.channel_id,
                "text-to-emoji"
            );
        }
    });
    

    app.command("/emoji-to-text", async ({ command, ack, respond, client }) => {
        await ack();
        const text = command.text.trim();

        if (text) {
            let chatHistory = await getChatHistory(client, command.channel_id);

            let translated = "";
            try {
                translated = await translate(text, false, chatHistory); 
            } catch (err) {
                console.error("Translate backend error:", err);
                translated = "Translation failed. Please try again later.";
            }

            const feedbackBlocks = buildFeedbackBlocks(text);

            addHistory(command.user_id, {
                original: text,
                translated: translated,
                direction: "emoji-to-text", 
                timestamp: new Date().toISOString(),
                channel: command.channel_id
            });

            try {
                // --- Public or group channel ---
                await client.chat.postMessage({
                    channel: command.channel_id,
                    response_type: "in_channel",
                    text: `*🔅 Translation Result*\n\n` +
                    `• *Original Text:* ${text}\n` +
                    `• *Emoji → Text:* ${translated}\n`,
                });

                // --- Feedback form (only visible to the user) ---
                await client.chat.postEphemeral({
                    channel: command.channel_id,
                    user: command.user_id,
                    text: "Feedback on this translation",
                    blocks: feedbackBlocks,
                });

            } catch (err) {

                // --- Private DM fallback ---
                if (err.data?.error === "channel_not_found") {
                    await respond({
                        response_type: "ephemeral",
                        replace_original: false,
                        blocks: [
                            {
                                type: "section",
                                text: {
                                    type: "mrkdwn",
                                    text: `*🔅 Translation Result*\n\n` +
                    `• *Original Text:* ${text}\n` +
                    `• *Emoji → Text:* ${translated}\n`
                                },
                            },
                            ...feedbackBlocks,
                        ],
                    });
                } else {
                    console.error(err);
                }
            }

        } else {
            // --- If no emoji typed → open interactive modal ---
            await openTranslateModal(
                client,
                command.trigger_id,
                command.channel_id,
                "emoji-to-text"
            );
        }
    });

    app.command("/history", async ({ command, ack, respond, client }) => {
        await ack();

        const history = getHistory(command.user_id); 

        if (history.length === 0) {
            try {
                await client.chat.postEphemeral({
                    channel: command.channel_id,
                    user: command.user_id,
                    text: "No translation history yet."
                });
            } catch (err) {
                if (err.data?.error === "channel_not_found") {
                    await respond({
                        response_type: "ephemeral",
                        replace_original: false,
                        blocks: [
                            {
                                type: "section",
                                text: {
                                    type: "mrkdwn",
                                    text: "*No translation history yet.*"
                                }
                            }
                        ]
                    });
                } else {
                    console.error(err);
                }
            }
            return;
        }

        const blocks = [];
        const emojiNumbers = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];

        history.slice(-10).forEach((h, i) => {
            const num = emojiNumbers[i] || "🔢"; 

            blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text:
                        `${num}  *${h.direction}*   \`${h.timestamp}\`\n` +
                        `• *Original:* ${h.original}\n` +
                        `• *Translated:* ${h.translated}`
                }
            });

            blocks.push({ type: "divider" });
        });

        try {
            await client.chat.postEphemeral({
                channel: command.channel_id,
                user: command.user_id,
                text: "Your Translation History",
                blocks
            });
        } catch (err) {
            // --- Private DM fallback ---
            if (err.data?.error === "channel_not_found") {
                await respond({
                    response_type: "ephemeral",
                    blocks
                });
            } else {
                console.error(err);
            }
        }
    });

};