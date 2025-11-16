// src/routes/commands.js
const { buildFeedbackBlocks } = require("../utils/feedback");
const { styleMap } = require("../utils/style");


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
                    text: `:sparkles: *Text → Emoji by ${command.user_name}:*\n${emojiTranslation}`,
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
                            text: `:sparkles: *Text → Emoji:*\n${emojiTranslation}`,
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
            // modal should change in future for specific text-to-emoji or emoji-to-text
            // currently both use same modal for simplicity
            await client.views.open({
                trigger_id: command.trigger_id,
                view: {
                type: "modal",
                callback_id: "/text-to-emoji_modal",
                title: { type: "plain_text", text: "Select Generation Style" },
                submit: { type: "plain_text", text: "Translate" },
                close: { type: "plain_text", text: "Cancel" },
                private_metadata: JSON.stringify({ channel_id: command.channel_id }),
                blocks: [
                    {
                        type: "input",
                        block_id: "input_text",
                        label: { type: "plain_text", text: "Enter text or emojis" },
                        element: { type: "plain_text_input", action_id: "value_input" },
                    },
                    {
                        type: "input",
                        block_id: "style_select",
                        label: { type: "plain_text", text: "Choose generation style" },
                        element: {
                            type: "static_select",
                            action_id: "style_choice",
                            options: Object.entries(styleMap).map(([value, text]) => ({
                            text: { type: "plain_text", text },
                            value,
                            })),
                        },
                    },
                ],
                },
            });
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
                    text: `:sparkles: *Emoji → text by ${command.user_name}:*\n${emojiTranslation}`,
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
                        text: `:sparkles: *Emoji → text:*\n${emojiTranslation}`,
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
        await client.views.open({
            trigger_id: command.trigger_id,
            view: {
            type: "modal",
            callback_id: "/emoji-to-text_modal",
            title: { type: "plain_text", text: "Select Generation Style" },
            submit: { type: "plain_text", text: "Translate" },
            close: { type: "plain_text", text: "Cancel" },
            private_metadata: JSON.stringify({ channel_id: command.channel_id }),
            blocks: [
                {
                    type: "input",
                    block_id: "input_text",
                    label: { type: "plain_text", text: "Enter text or emojis" },
                    element: { type: "plain_text_input", action_id: "value_input" },
                },
                {
                    type: "input",
                    block_id: "style_select",
                    label: { type: "plain_text", text: "Choose generation style" },
                    element: {
                        type: "static_select",
                        action_id: "style_choice",
                        options: Object.entries(styleMap).map(([value, text]) => ({
                        text: { type: "plain_text", text },
                        value,
                        })),
                    },
                },
            ],
            },
        });
        }
    });
};