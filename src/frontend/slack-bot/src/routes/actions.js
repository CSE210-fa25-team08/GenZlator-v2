const { styleMap, setUserStyle } = require("../utils/style");
const { buildHomeView } = require("../utils/homeView");

module.exports = function registerActions(app) {
    // --- Handle modal submission for default style setting ---
    app.action("open_default_setting", async ({ ack, body, client }) => {
        await ack();
        const modal = {
            type: "modal",
            callback_id: "default_style_modal",
            title: { type: "plain_text", text: "Default Style Setting" },
            submit: { type: "plain_text", text: "Save" },
            close: { type: "plain_text", text: "Cancel" },
            blocks: [
            {
                type: "input",
                block_id: "style_select",
                label: {
                type: "plain_text",
                text: "Choose your default generation style",
                },
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
        };
        await client.views.open({ trigger_id: body.trigger_id, view: modal });
    });

    // --- Handle feedback modal in the App Home ---
    // might delete in future
    app.action("open_feedback", async ({ ack, body, client }) => {
        await ack();
        const modal = {
            type: "modal",
            callback_id: "feedback_modal",
            title: { type: "plain_text", text: "Feedback" },
            submit: { type: "plain_text", text: "Submit" },
            blocks: [
            {
                type: "input",
                block_id: "feedback_block",
                label: { type: "plain_text", text: "Your feedback" },
                element: {
                type: "plain_text_input",
                action_id: "feedback_input",
                multiline: true,
                },
            },
            ],
        };
        await client.views.open({ trigger_id: body.trigger_id, view: modal });
    });

    // --- Handle feedback buttons in messages ---
    app.action("feedback_yes", async ({ ack, body, client, respond }) => {
        await ack();
        if (body.response_url) {
            await respond({
            response_type: "in_channel",
            replace_original: false,
            text: `✅ <@${body.user.id}> clicked *Yes*! Thanks for the feedback.`,
            });
        } else {
            await client.chat.postMessage({
            channel: body.channel.id,
            text: `✅ <@${body.user.id}> clicked *Yes*!`,
            });
        }
    });

    // --- Handle feedback buttons in messages ---
    app.action("feedback_no", async ({ ack, body, client, respond }) => {
        await ack();

        if (body.response_url) {
            await respond({
            response_type: "in_channel",
            replace_original: false,
            text: `🫤 <@${body.user.id}> clicked *No*. We'll keep improving!`,
            });
        } else {
            await client.chat.postMessage({
            channel: body.channel.id,
            text: `🫤 <@${body.user.id}> clicked *No*.`,
            });
        }
    });

};
