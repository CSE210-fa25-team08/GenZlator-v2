// src/routes/shortcuts.js

module.exports = function registerShortcuts(app) {
    // --- Shortcut: Translate ---

    // the shortcut ID is "translate", and need to align with the one set in Slack App configuration
    
    app.shortcut("translate", async ({ ack, body, client }) => {
        await ack();
        console.log("Shortcut payload:");

        await client.views.open({
            trigger_id: body.trigger_id,
            view: {
                type: "modal",
                callback_id: "translate_modal",
                title: { type: "plain_text", text: "Translate Text" },
                submit: { type: "plain_text", text: "Translate" },
                close: { type: "plain_text", text: "Cancel" },
                private_metadata: JSON.stringify({
                channel: body.channel.id,
                message: "Shortcut triggered",
                }),
                blocks: [
                {
                    type: "input",
                    block_id: "input_text",
                    label: { type: "plain_text", text: "Enter text or emoji" },
                    element: { type: "plain_text_input", action_id: "value_input" },
                },
                ],
            },
        });
    });
};