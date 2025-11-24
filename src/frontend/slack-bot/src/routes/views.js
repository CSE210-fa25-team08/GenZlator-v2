// src/routes/views.js
const { buildHomeView } = require("../utils/homeView");
const { setUserModel } = require("../utils/model");
const { buildFeedbackBlocks } = require("../utils/feedback");

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

        setUserModel(userId, styleChoice);

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

    // --- View: text-to-emoji_modal (from Interactive translate mode) ---
    app.view("text-to-emoji_modal", async ({ ack, body, client }) => {
        await ack();
        const metadata = JSON.parse(body.view.private_metadata);
        const channel = metadata.channel_id;

        const input =
        body.view.state.values.input_text.value_input.value;
        const model =
        body.view.state.values.model_select.model_choice.selected_option.value;

        const feedbackBlocks = buildFeedbackBlocks(input);

        // Dummy translation
        const translated = `Dummy Emoji Output for: "${input}"`;
        // todo : also support private DM case
        await client.chat.postMessage({
            channel,
            text: `*Text → Emoji*\n*Model:* ${model}\n*Original:* ${input}\n*Translated:* ${translated}`
        });
        await client.chat.postMessage({
            channel,
            blocks: feedbackBlocks,
        });
    });

    // --- View: emoji-to-text_modal (from Interactive translate mode) ---
    app.view("emoji-to-text_modal", async ({ ack, body, client }) => {
        await ack();
        const metadata = JSON.parse(body.view.private_metadata);
        const channel = metadata.channel_id;
        const input =
        body.view.state.values.input_text.value_input.value;
        const model =
        body.view.state.values.model_select.model_choice.selected_option.value;

        const feedbackBlocks = buildFeedbackBlocks(input);
        // Dummy translation
        const translated = `Dummy Text Output for: "${input}"`;

        // todo : also support private DM case
        await client.chat.postMessage({
            channel,
            text: `*Emoji → Text*\n*Model:* ${model}\n*Original:* ${input}\n*Translated:* ${translated}`
        });
        await client.chat.postMessage({
            channel,
            blocks: feedbackBlocks,
        });
    });


    // --- Handle feedback suggestion modal in messages ---
    app.view("feedback_suggestion_modal", async ({ ack, body, view }) => {
        const suggestion = view.state.values.suggestion_block.suggestion_input.value;
    
        console.log("Feedback received:", {
          user: body.user.id,
          suggestion,
        });
        //could be replaced
        const { sendFeedback } = require("../utils/backendClient");
        try {
        await sendFeedback(
            originalInput,     
            suggestion,          
            body.user.id,     
            4                
        );
        } catch (err) {
            console.error("Feedback backend error:", err);
        }
        //

        await ack({
            response_action: "update",
            view: {
              type: "modal",
              title: {
                type: "plain_text",
                text: "Thank you!",
              },
              close: {
                type: "plain_text",
                text: "Close",
              },
              blocks: [
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text:
                      `🎉 Thanks for your feedback, <@${body.user.id}>!\n\n` +
                      `We’ve received your suggestions and will use them to improve Emoji Translator.`,
                  },
                },
              ],
            },
        });
    });
};