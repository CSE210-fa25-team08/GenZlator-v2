// src/routes/commands.js
const { buildFeedbackBlocks } = require("../utils/feedback");
const { modelMap } = require("../utils/model");
const { openTranslateModal } = require("../utils/commandTranslate");
const { translate } = require("../utils/backendClient");
const { getLastTwoMessages } = require("../utils/chatHistory");


// currently, the response can be viewed by all members in the channel
// future work: if in a public channel, add setting to make response visible to only the command user

module.exports = function registerCommands(app) {
    // --- /text-to-emoji ---
    app.command("/text-to-emoji", async ({ command, ack, respond, client }) => {
        await ack();
        const text = command.text.trim();
    
        if (text) {
            const { translate } = require("../utils/backendClient");
            const { buildFeedbackBlocks } = require("../utils/feedback");
    
            let chatHistory = await getLastTwoMessages(client, body);

            console.log("📤 Sending to backend:", {
                originalMessage: text,
                isToEmoji: true,
                chatHistory
            });
            

            let translated = "";
            try {
                translated = await translate(text, true, chatHistory);  
            } catch (err) {
                console.error("Translate backend error:", err);
                translated = "⚠️ Translation failed. Please try again later.";
            }
    
            const feedbackBlocks = buildFeedbackBlocks(text);
    
            try {
                // Public channel → send translation to channel
                await client.chat.postMessage({
                    channel: command.channel_id,
                    response_type: "in_channel",
                    text: `*Text → Emoji by ${command.user_name}:*\n${translated}`,
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
                                    text: `*Text → Emoji:*\n${translated}`,
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
            const { translate } = require("../utils/backendClient");
            const { buildFeedbackBlocks } = require("../utils/feedback");


            let chatHistory = await getLastTwoMessages(client, body);

            let translated = "";
            try {
                //backend：emoji → text
                translated = await translate(text, false, chatHistory);  // false → emoji-to-text mode
            } catch (err) {
                console.error("Translate backend error:", err);
                translated = "⚠️ Translation failed. Please try again later.";
            }

            const feedbackBlocks = buildFeedbackBlocks(text);

            try {
                // --- Public or group channel ---
                await client.chat.postMessage({
                    channel: command.channel_id,
                    response_type: "in_channel",
                    text: `*Emoji → Text by ${command.user_name}:*\n${translated}`,
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
                                    text: `*Emoji → Text:*\n${translated}`,
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

 };