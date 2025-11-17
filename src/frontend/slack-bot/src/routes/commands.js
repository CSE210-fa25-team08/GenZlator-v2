// src/routes/commands.js
const { buildFeedbackBlocks } = require("../utils/feedback");
const { modelMap } = require("../utils/model");
const { openTranslateModal } = require("../utils/commandTranslate");


// currently, the response can be viewed by all members in the channel
// future work: if in a public channel, add setting to make response visible to only the command user

module.exports = function registerCommands(app) {
    // --- /text-to-emoji ---
    app.command("/text-to-emoji", async ({ command, ack, respond, client }) => {
        await ack();
        const text = command.text.trim();

        // if text is provided, do quick translation
        if (text) {
            const emojiTranslation = "test data : " + text;
            const feedbackBlocks = buildFeedbackBlocks(text);

            try {
                // group channel or public channel
                await client.chat.postMessage({
                    channel: command.channel_id,
                    response_type: "in_channel",
                    text: `*Text → Emoji by ${command.user_name}:*\n${emojiTranslation}`,
                    });

                await client.chat.postMessage({
                    channel: command.channel_id,
                    response_type: "in_channel",
                    blocks: feedbackBlocks,
                });
            } catch (err) {
                // private DM or other error
                if (err.data?.error === "channel_not_found") {
                    await respond({
                        response_type: "ephemeral",
                        replace_original: false,
                        blocks: [
                        {
                            type: "section",
                            text: {
                            type: "mrkdwn",
                            text: `*Text → Emoji:*\n${emojiTranslation}`,
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
            // if no text, open interactive modal
            await openTranslateModal(
                client,
                command.trigger_id,
                command.channel_id,
                "text-to-emoji"
            );
        }
    });

    // --- /emoji-to-text ---
    app.command("/emoji-to-text", async ({ command, ack, respond, client }) => {
        await ack();
        const text = command.text.trim();

        if (text) {
            const emojiTranslation = "test data : " + text;
            const feedbackBlocks = buildFeedbackBlocks(text);

            try {
                // group channel or public channel
                await client.chat.postMessage({
                    channel: command.channel_id,
                    response_type: "in_channel",
                    text: `*Emoji → text by ${command.user_name}:*\n${emojiTranslation}`,
                    });

                await client.chat.postMessage({
                    channel: command.channel_id,
                    response_type: "in_channel",
                    blocks: feedbackBlocks,
                });
            } catch (err) {
                // private DM or other error
                if (err.data?.error === "channel_not_found") {
                await respond({
                    response_type: "ephemeral",
                    replace_original: false,
                    blocks: [
                    {
                        type: "section",
                        text: {
                        type: "mrkdwn",
                        text: `*Emoji → text:*\n${emojiTranslation}`,
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
            // Interactive modal
            await openTranslateModal(
                client,
                command.trigger_id,
                command.channel_id,
                "emoji-to-text"
            );
        }
    });
};