// src/routes/views.js
const { buildHomeView } = require("../utils/homeView");
const { setUserStyle } = require("../utils/style");

module.exports = function registerViews(app) {
    // --- View: shortcut translate_modal (from translate_shortcut shortcut) ---
    // I think we don't need this anymore?  Cause we deicded to post directly from shortcut
    app.view("translate_modal", async ({ ack, body, client }) => {
        await ack();

        const { channel, message } = JSON.parse(body.view.private_metadata);
        const user = body.user.username;
        const fakeTranslation = "fake translate result";

        await client.chat.postMessage({
        channel,
        text: `:sparkles: *Emoji Translation by ${user}:*\n> *Original:* ${message}\n${fakeTranslation}`,
        });

        await client.chat.postMessage({
            channel,
            blocks: [
                {
                type: "section",
                text: { type: "mrkdwn", text: "*Do you like this translation?*" },
                },
                {
                type: "actions",
                elements: [
                    {
                    type: "button",
                    text: { type: "plain_text", text: "Yes" },
                    style: "primary",
                    action_id: "feedback_yes",
                    },
                    {
                    type: "button",
                    text: { type: "plain_text", text: "No" },
                    style: "danger",
                    action_id: "feedback_no",
                    },
                ],
                },
            ],
        });
   });

    // --- View: default_style_modal (from open_default_setting action) ---
    app.view("default_style_modal", async ({ ack, body, client }) => {
        await ack();

        const userId = body.user.id;
        const styleChoice =
        body.view.state.values.style_select.style_choice.selected_option.value;

        setUserStyle(userId, styleChoice);

        const newHome = buildHomeView(styleChoice);
        await client.views.publish({ user_id: userId, view: newHome });
    });

    // --- View: feedback_modal (from open_feedback action) ---
    app.view("feedback_modal", async ({ ack, body }) => {
        await ack();
        const feedback =
        body.view.state.values.feedback_block.feedback_input.value;
        console.log(`Feedback from ${body.user.username}: ${feedback}`);
    });

    // --- View: /text-to-emoji_modal ---
    app.view("/text-to-emoji_modal", async ({ ack, body, client }) => {
        await ack();
        const metadata = JSON.parse(body.view.private_metadata);
        await client.chat.postMessage({
        channel: metadata.channel_id,
        text: "testing for Slash Command Interactive Mode",
        });
    });

    // --- View: /emoji-to-text_modal ---
    app.view("/emoji-to-text_modal", async ({ ack, body, client }) => {
        await ack();
        const metadata = JSON.parse(body.view.private_metadata);
        await client.chat.postMessage({
        channel: metadata.channel_id,
        text: "testing for Slash Command Interactive Mode",
        });
    });
};