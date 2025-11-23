const { modelMap } = require("./model");

// --- Helper: build App Home view ---
// markdown for Slack App Home
// I move it here in order to reduce code duplication
// might change in future
function buildHomeView(currentStyle) {
  const selected = modelMap[currentStyle] || modelMap.default;

  return {
    type: "home",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "👋 Welcome to *Emoji Translator*! 🎉\n" +
            "Turn text into emojis (and back) to make your messages more fun and expressive.",
        },
      },

      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Your current default style: *${selected}*`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Change Default Style" },
            action_id: "open_default_setting",
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Feedback" },
            action_id: "open_feedback",
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Website" },
            action_id: "tmp",
          },
        ],
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*User Guide*\nUse these slash commands:\n
• \`/text-to-emoji [text]\`
   - With \`[text]\`: convert the text into emojis directly (quick mode)
   - Without arguments: open a *modal* to choose style / options before translating

• \`/emoji-to-text [emoji]\`
   - With \`[emoji]\`: convert emojis back to text directly (quick mode)
   - Without arguments: open a *modal* to choose style / options before translating

If you type the command without arguments, an interactive modal will appear to choose a *generation style* like ✨ Default, 🐰 Cute, 😂 Funny, or 💼 Formal.`,
        },
      },


      { type: "divider" },

      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "*Feedback*\n" +
            "- After each translation, you'll see a small question: *“Do you like this translation?”* with Yes / No buttons.\n" +
            "- If you click *No*, you can optionally suggest a better translation to help us improve.\n" +
            "- You can also press the *Feedback* button above to send more detailed comments.",
        },
      },


      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "_Tip: Return here from the App Home tab for settings and help._",
          },
        ],
      },
    ],
  };
}

module.exports = { buildHomeView };