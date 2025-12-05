// src/utils/commandTranslate.js
const { modelMap } = require("../utils/model");

function buildModelOptions() {
  return Object.entries(modelMap).map(([value, text]) => ({
    text: { type: "plain_text", text },
    value,
  }));
}

function getInputLabel(mode) {
  if (mode === "text-to-emoji") return "Enter text";
  if (mode === "emoji-to-text") return "Enter emojis";
  return "Enter text or emojis"; // fallback
}

function getModalTitle(mode) {
  if (mode === "text-to-emoji") return "Text → Emoji";
  if (mode === "emoji-to-text") return "Emoji → Text";
  return "Translator";
}


async function openTranslateModal(client, trigger_id, channel_id, mode) {
  return client.views.open({
    trigger_id,
    view: {
      type: "modal",
      callback_id: `${mode}_modal`,
      title: { type: "plain_text", text: getModalTitle(mode) },
      submit: { type: "plain_text", text: "Translate" },
      close: { type: "plain_text", text: "Cancel" },
      private_metadata: JSON.stringify({ channel_id, mode }),

      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Welcome to the custom translation panel!*\nUse this interface to enter your content and select a model for translation.",
          },
        },
        {
          type: "divider",
        },
        {
          type: "input",
          block_id: "input_text",
          label: { type: "plain_text", text: getInputLabel(mode) },
          element: {
            type: "plain_text_input",
            action_id: "value_input"
          },
        },
        {
          type: "input",
          block_id: "model_select",
          label: { type: "plain_text", text: "Choose Model" },
          element: {
            type: "static_select",
            action_id: "model_choice",
            options: buildModelOptions(),
          },
        },
        {
          type: "input",
          block_id: "visibility_select",
          label: {
            type: "plain_text",
            text: "Send Result As"
          },
          element: {
            type: "static_select",
            action_id: "visibility_choice",
            options: [
              {
                text: { type: "plain_text", text: "🔊 Send to Channel (Public)" },
                value: "public"
              },
              {
                text: { type: "plain_text", text: "👤 Send Only to Me (Private)" },
                value: "private"
              }
            ],
            initial_option: {
              text: { type: "plain_text", text: "🔊 Send to Channel (Public)" },
              value: "public"
            }
          }
        }
      ],
    },
  });
}

module.exports = {
  openTranslateModal,
};