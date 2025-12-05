const { modelMap, setUserModel } = require("../utils/model");
const { buildHomeView } = require("../views/homeView");
const { sendFeedback } = require("../utils/backendClient");
const { renderHome } = require("../utils/renderHome");

module.exports = function registerActions(app) {
    // --- Handle modal submission for default style setting ---
    app.action("open_default_setting", async ({ ack, body, client }) => {
        await ack();
        const modal = {
            type: "modal",
            callback_id: "default_style_modal",
            title: { type: "plain_text", text: "Default Model Setting" },
            submit: { type: "plain_text", text: "Save" },
            close: { type: "plain_text", text: "Cancel" },
            blocks: [
            {
                type: "input",
                block_id: "style_select",
                label: {
                type: "plain_text",
                text: "Choose your default model",
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
            close: { type: "plain_text", text: "Cancel" },
            blocks: [
              {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text:
                      "Thanks for helping us improve Emoji Translator! " +
                      "Your suggestions help us make the app better for everyone. 🙏",
                  },
                },
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
              {
                  type: "input",
                  block_id: "email_block",
                  optional: true,
                  element: {
                    type: "plain_text_input",
                    action_id: "email_input",
                    placeholder: {
                      type: "plain_text",
                      text: "you@example.com",
                    },
                  },
                  label: {
                    type: "plain_text",
                    text: "Email (optional)",
                  },
                },
                {
                  type: "context",
                  elements: [
                    {
                      type: "mrkdwn",
                      text:
                        "_If we have follow-up questions, we may reach out using the email provided._",
                    },
                  ],
                },
            ],
        };
        await client.views.open({ trigger_id: body.trigger_id, view: modal });
    });

    // --- Handle feedback buttons in messages ---
    app.action("feedback_yes", async ({ ack, body, respond }) => {
        await ack();
      
        const originalInput = body.actions[0].value;
        console.log("User liked the translation, original input " + originalInput);
        await sendFeedback(originalInput, "", body.user.id, 1);

        await respond({
          replace_original: true,  
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

        const originalInput = body.actions[0].value;
      
        await respond({
          replace_original: true,
          text: "Got it, any suggested translation?",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `🫤 <@${body.user.id}> clicked *No*. We'll keep improving! Do you have any suggestion for us?`,
              },
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  style: "primary",
                  text: { type: "plain_text", text: "Yes" },
                  action_id: "feedback_sure",
                  value: originalInput,
                },
                {
                  type: "button",
                  style: "danger",
                  text: { type: "plain_text", text: "No" },
                  action_id: "feedback_no_thanks",
                  value: originalInput,
                },
              ],
            },
          ],
        });
    });
      
      
    // --- Handle feedback suggestion buttons in messages ---
    app.action("feedback_sure", async ({ ack, body, client, respond }) => {
        await ack();
        const originalInput = body.actions[0].value;
        await respond({
            replace_original: true,
            text: "Please write your suggested translation in the modal.",
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text:
                    "✍️ Please write your suggested translation in the modal that just opened. \n" + 
                    "Thank you for helping us improve, <@" +
                    body.user.id +
                    ">!",
                },
              },
            ],
          });

          console.log("Opening feedback suggestion modal");
      
          await client.views.open({
              trigger_id: body.trigger_id,
              view: {
                type: "modal",
                callback_id: "feedback_suggestion_modal",
                private_metadata: JSON.stringify({
                  originalInput,
                  channel: body.channel.id
                }),
                title: {
                  type: "plain_text",
                  text: "Improve Translation", 
                },
                
                submit: {
                  type: "plain_text",
                  text: "Submit feedback",
                },
                close: {
                  type: "plain_text",
                  text: "Cancel",
                },
                blocks: [

                  {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text:
                        "Thanks for helping us improve Emoji Translator! \n" +
                        "Your suggestions help us make the app better for everyone!",
                    },
                  },
            
                  {
                    type: "divider",
                  },
                  {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: "*How can we improve this translation?*",
                    },
                  },
            
                  {
                    type: "input",
                    block_id: "suggestion_block",
                    element: {
                      type: "plain_text_input",
                      action_id: "suggestion_input",
                      multiline: true,
                      placeholder: {
                        type: "plain_text",
                        text: "Tell us your improved translation...",
                      },
                    },
                    label: {
                      type: "plain_text",
                      text: "Your feedback",
                    },
                  }
                ],
            },
        });
          
    });
      
    // --- Handle feedback suggestion modal in messages ---
    app.action("feedback_no_thanks", async ({ ack, body, respond }) => {
        await ack();
        const originalInput = body.actions[0].value;
        console.log("User declined to provide suggestion, original input " + originalInput);
        await sendFeedback(originalInput, "", body.user.id, 0);
      
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
    

    app.action("nav_overview", async ({ ack, body, client }) => {
        await ack();
        await renderHome(client, body.user.id, "overview");
    });

    app.action("nav_history", async ({ ack, body, client }) => {
        await ack();
        await renderHome(client, body.user.id, "history");
    });
      
      

};
