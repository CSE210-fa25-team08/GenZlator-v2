// src/routes/views.js
const { buildHomeView } = require("../utils/homeView");
const { setUserModel } = require("../utils/model");
const { buildFeedbackBlocks } = require("../utils/feedback");
const { sendFeedback } = require("../utils/backendClient");
const { getChatHistory } = require("../utils/chatHistory");

module.exports = function registerViews(app) {
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
        const visibility =
        body.view.state.values.visibility_select.visibility_choice.selected_option.value;


        let chatHistory = await getChatHistory(client, channel);

        console.log("📤 Sending to backend:", {
            originalMessage: input,
            isToEmoji: true,
            chatHistory
        });

        let translated = "";
        try {
            // translated = await translate(input, true, chatHistory);
        } catch (err) {
            console.error("Translate backend error:", err);
            translated = "⚠️ Translation failed. Please try again later.";
        }

        const feedbackBlocks = buildFeedbackBlocks(input);

        // await client.chat.postMessage({
        //     channel,
        //     text: `*Text → Emoji*\n*Model:* ${model}\n*Original:* ${input}\n*Translated:* ${translated}`
        // });
    
        // await client.chat.postMessage({
        //     channel,
        //     blocks: feedbackBlocks,
        // });
        if (visibility === "public") {
            // Send to whole channel
            await client.chat.postMessage({
                channel,
                text: `*Text → Emoji*\n*Model:* ${model}\n*Original:* ${input}\n*Translated:* ${translated}`
            });
    
            await client.chat.postMessage({
                channel,
                blocks: feedbackBlocks,
            });
    
        } else {
            // Send ONLY to the user
            await client.chat.postEphemeral({
                channel,
                user: body.user.id,
                text: `*Text → Emoji*\n*Model:* ${model}\n*Original:* ${input}\n*Translated:* ${translated}`
            });
    
            await client.chat.postEphemeral({
                channel,
                user: body.user.id,
                blocks: feedbackBlocks,
            });
        }
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
        const visibility =
        body.view.state.values.visibility_select.visibility_choice.selected_option.value;

        let chatHistory = await getChatHistory(client, channel);

        console.log("📤 Sending to backend:", {
            originalMessage: input,
            isToEmoji: true,
            chatHistory
        });


        let translated = "";
        try {
            //translated = await translate(input, false, chatHistory);
        } catch (err) {
            console.error("Translate backend error:", err);
            translated = "⚠️ Translation failed. Please try again later.";
        }

        const feedbackBlocks = buildFeedbackBlocks(input);

        // todo : also support private DM case
        // await client.chat.postMessage({
        //     channel,
        //     text: `*Emoji → Text*\n*Model:* ${model}\n*Original:* ${input}\n*Translated:* ${translated}`
        // });
    
        // await client.chat.postMessage({
        //     channel,
        //     blocks: feedbackBlocks,
        // });
        if (visibility === "public") {
            // Send to whole channel
            await client.chat.postMessage({
                channel,
                text: `*Emoji → Text*\n*Model:* ${model}\n*Original:* ${input}\n*Translated:* ${translated}`
            });

            await client.chat.postMessage({
                channel,
                blocks: feedbackBlocks,
            });

        } else {
            // Send ONLY to the user
            await client.chat.postEphemeral({
                channel,
                user: body.user.id,
                text: `*Emoji → Text*\n*Model:* ${model}\n*Original:* ${input}\n*Translated:* ${translated}`
            });

            await client.chat.postEphemeral({
                channel,
                user: body.user.id,
                blocks: feedbackBlocks,
            });
        }
    });


    // --- Handle feedback suggestion modal in messages ---
    app.view("feedback_suggestion_modal", async ({ ack, body, view, client}) => {
        const suggestion = view.state.values["suggestion_block"]["suggestion_input"].value;
        const metadata = JSON.parse(view.private_metadata);
        const originalInput = metadata.originalInput;
        const channel = metadata.channel;

        console.log("Feedback received:", {
          user: body.user.id,
          suggestion,
            originalInput,
        });

        try {
            // backend broke rightnow 
            // await sendFeedback(originalInput, suggestion, body.user.id, 0);
        } catch (err) {
            console.error("Feedback backend error:", err);
        }

        await ack({ response_action: "clear" });

        await client.chat.postEphemeral({
            channel: channel,
            user: body.user.id,
            text: `Thanks for your feedback!`,
        });


    });
};