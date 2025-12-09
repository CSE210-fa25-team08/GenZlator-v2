// src/routes/views.js
const { setUserModel } = require("../utils/model");
const { buildFeedbackBlocks } = require("../views/feedback");
const { sendFeedback, translate } = require("../utils/backendClient");
const { getChatHistory } = require("../utils/chatHistory");
const { addHistory } = require("../storage/history");
const { renderHome } = require("../utils/renderHome");
const { translateToEmojis, translateToWords } = require("../utils/translateFallback");
const { withTimeout } = require("../utils/withTimeout");

module.exports = function registerViews(app) {
    // --- View: default_style_modal (from open_default_setting action) ---
    app.view("default_style_modal", async ({ ack, body, client }) => {
        await ack();

        const userId = body.user.id;
        const styleChoice =
        body.view.state.values.style_select.style_choice.selected_option.value;

        setUserModel(userId, styleChoice);

        await renderHome(client, userId, "overview");
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
        const userId = body.user.id;
        const input =
        body.view.state.values.input_text.value_input.value;
        if (input.length > 1000) {
            await client.chat.postEphemeral({
                channel: channel,
                user: userId,
                text: `❗ Your input is too long (${input.length} characters). Please keep it under 1000 characters.`,
            });
            return; 
        }

        const model =
            body.view.state.values?.model_select?.model_choice?.selected_option?.value
            ?? "gpt4omini";
        const visibility =
        body.view.state.values.visibility_select.visibility_choice.selected_option.value;

        let chatHistory = await getChatHistory(client, channel);

        let translated = "";
        try {
            translated = await withTimeout(
                translate(input, true, chatHistory),
                3000, 
                "Translation backend timeout"
            );
        } catch (err) {
            console.error("Translate backend error:", err);
            translated = translateToEmojis(input);
        }
        
        addHistory(userId, {
            original: input,
            translated: translated,
            direction: "text-to-emoji", 
            timestamp: new Date().toISOString(),
            channel: channel
        });

        const feedbackBlocks = buildFeedbackBlocks(input);

        if (visibility === "public") {
            // Send to whole channel
            await client.chat.postMessage({
                channel,
                text: `*🔅 Translation Result* ` +
                `*by:* <@${userId}>\n` +
                    `• *Original Input:* ${input}\n` +
                    `• *Text → Emoji:* ${translated}\n`,
            });
    
            await client.chat.postEphemeral({
                channel,
                user: body.user.id,
                blocks: feedbackBlocks,
            });
    
        } else {
            // Send ONLY to the user
            await client.chat.postEphemeral({
                channel,
                user: body.user.id,
                text: `*🔅 Translation Result*\n\n` +
                    `• *Original Input:* ${input}\n` +
                    `• *Text → Emoji:* ${translated}\n`,
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
        const userId = body.user.id;
        const input =
        body.view.state.values.input_text.value_input.value;
        if (input.length > 1000) {
            await client.chat.postEphemeral({
                channel: channel,
                user: userId,
                text: `❗ Your input is too long (${input.length} characters). Please keep it under 1000 characters.`,
            });
            return; 
        }
        
        const model =
            body.view.state.values?.model_select?.model_choice?.selected_option?.value
            ?? "gpt4omini";
        const visibility =
        body.view.state.values.visibility_select.visibility_choice.selected_option.value;

        let chatHistory = await getChatHistory(client, channel);

        let translated = "";
        try {
            translated = await withTimeout(
                translate(input, false, chatHistory),
                3000, 
                "Translation backend timeout"
            );
        } catch (err) {
            console.error("Translate backend error:", err);
            translated = await translateToWords(input);
        }

        const feedbackBlocks = buildFeedbackBlocks(input);

        addHistory(userId, {
            original: input,
            translated: translated,
            direction: "emoji-to-text", 
            timestamp: new Date().toISOString(),
            channel: channel
        });
        if (visibility === "public") {
            // Send to whole channel
            await client.chat.postMessage({
                channel,
                text: `*🔅 Translation Result* ` +
                `*by:* <@${userId}>\n` +
                    `• *Original Input:* ${input}\n` +
                    `• *Emoji → Text:* ${translated}\n`,
            });

            await client.chat.postEphemeral({
                channel,
                user: body.user.id,
                blocks: feedbackBlocks,
            });

        } else {
            // Send ONLY to the user
            await client.chat.postEphemeral({
                channel,
                user: body.user.id,
                text: `*🔅 Translation Result*\n\n` +
                    `• *Original Input:* ${input}\n` +
                    `• *Emoji → Text:* ${translated}\n`,
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
            await sendFeedback(originalInput, suggestion, body.user.id, 0);
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