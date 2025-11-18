const { modelMap, setUserModel } = require("../utils/model");
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
                options: Object.entries(modelMap).map(([value, text]) => ({
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
    app.action("feedback_yes", async ({ ack, body, respond }) => {
        await ack();
      
        await respond({
          replace_original: true,   // 🔥 用這個替換原本的 ephemeral
          text: `👍 Thanks for your feedback, <@${body.user.id}>!`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `👍 Thanks for your feedback, <@${body.user.id}>!`,
              },
            },
          ],
        });
      });
      
    

    // --- Handle feedback buttons in messages ---
    app.action("feedback_no", async ({ ack, body, respond }) => {
        await ack();
      
        await respond({
          replace_original: true,
          text: "Got it, any suggested translation?",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `🫤 <@${body.user.id}> clicked *No*. We'll keep improving!`,
              },
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: { type: "plain_text", text: "Sure ✍️" },
                  action_id: "feedback_sure",
                  value: "feedback_sure",
                },
                {
                  type: "button",
                  text: { type: "plain_text", text: "No thanks 🙅‍♀️" },
                  action_id: "feedback_no_thanks",
                  value: "feedback_no_thanks",
                },
              ],
            },
          ],
        });
      });
      
      
        // --- Handle feedback suggestion buttons in messages ---
      app.action("feedback_sure", async ({ ack, body, client, respond }) => {
        await ack();

        await respond({
          replace_original: true,
          text: "Please write your suggested translation in the modal.",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text:
                  "✍️ Please write your suggested translation in the modal that just opened. " +
                  "Thank you for helping us improve, <@" +
                  body.user.id +
                  ">!",
              },
            },
          ],
        });
      
        await client.views.open({
          trigger_id: body.trigger_id,
          view: {
            type: "modal",
            callback_id: "feedback_suggestion_modal",
            title: {
              type: "plain_text",
              text: "Suggested translation",
            },
            submit: {
              type: "plain_text",
              text: "Submit",
            },
            close: {
              type: "plain_text",
              text: "Cancel",
            },
            blocks: [
              {
                type: "input",
                block_id: "suggestion_block",
                label: {
                  type: "plain_text",
                  text: "What translation do you think is better?",
                },
                element: {
                  type: "plain_text_input",
                  action_id: "suggestion_input",
                  multiline: true,
                  placeholder: {
                    type: "plain_text",
                    text: "Please type your suggested translation here!",
                  },
                },
              },
            ],
          },
        });
      });
    
      // --- Handle feedback suggestion modal in messages ---
      app.view("feedback_suggestion_modal", async ({ ack, body, view }) => {
        const suggestion =
          view.state.values.suggestion_block.suggestion_input.value;
      
        // later on connect this to database
        console.log("User suggested translation:", {
          user: body.user.id,
          suggestion,
        });

        await ack({
          response_action: "update",
          view: {
            type: "modal",
            callback_id: "feedback_suggestion_modal_thanks",
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
                    `🙏 We’ve received your suggested translation, <@${body.user.id}>.\n\n` +
                    `Thanks for helping us improve Emoji Translator!`,
                },
              },
            ],
          },
        });
      });
      
        // --- Handle feedback suggestion modal in messages ---
      app.action("feedback_no_thanks", async ({ ack, body, respond }) => {
        await ack();
      
        await respond({
          replace_original: true,
          text: "No problem, thanks!",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `👌 No problem — thank you for your feedback, <@${body.user.id}>!`,
              },
            },
          ],
        });
      });
      
      
      

};
