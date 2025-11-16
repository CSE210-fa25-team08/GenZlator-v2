const { styleMap } = require("./style");

// --- Helper: build App Home view ---
// markdown for Slack App Home
// I move it here in order to reduce code duplication
// might change in future
function buildHomeView(currentStyle) {
  const selected = styleMap[currentStyle] || styleMap.default;

  return {
    type: "home",
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: "👋 Welcome to *Emoji Translator*! 🎉" },
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
• \`/text-to-emoji [text]\` → Convert text into emojis (quick mode)
• \`/emoji-to-text [emoji]\` → Interpret emojis back to text (quick mode)

If you type the command without arguments, an interactive modal will appear to choose a *generation style* like ✨ Default, 🐰 Cute, 😂 Funny, or 💼 Formal.`,
        },
      },
      { type: "divider" },
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