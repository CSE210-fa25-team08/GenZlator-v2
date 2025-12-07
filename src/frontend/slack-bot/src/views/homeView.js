const model = require("../utils/model");
// --- Helper: build App Home view ---
// markdown for Slack App Home
// I move it here in order to reduce code duplication
// might change in future
function buildHomeView(mode, currentModel, historyBlocks) {

    const selectedModel = model.modelMap[currentModel];
    const selectedInfo = model.modelInfo[selectedModel];
    const isHistory = mode === "history";
    
    const modelDescriptionsMarkdown = Object.values(model.modelInfo)
        .map(m => {
            const strengths = m.strengths?.length
                ? m.strengths.map(s => `      - ${s}`).join("\n")
                : "";
            return `
• *${m.name}* — \`${m.id}\`
  - ${m.description || "No description available."}
  - Provider: *${m.provider || "Unknown"}*
  - Max tokens: ${m.max_tokens || "N/A"}
${strengths ? strengths : ""}
`;
        })
        .join("\n");

    const overviewBlocks = [
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
          text: `Your current default model:\n• *${selectedInfo?.name || selectedModel}* (\`${selectedModel}\`)`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Change Default Model" },
            action_id: "open_default_setting",
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Feedback" },
            action_id: "open_feedback",
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Our Website" },
            action_id: "tmp",
          },
        ],
      },

      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*🧭 User Guide*\nUse these slash commands:\n
• \`/text-to-emoji [text]\`
   - With \`[text]\`: convert the text into emojis directly (quick mode)
   - Without arguments: open a *modal* to choose style / options before translating

• \`/emoji-to-text [emoji]\`
   - With \`[emoji]\`: convert emojis back to text directly (quick mode)
   - Without arguments: open a *modal* to choose style / options before translating

If you type the command without arguments, an interactive modal will appear so you can select the model appropriate for your task.`,
        },
      },


      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "*🧭 How to Add Emojize to a Channel*\n" +
            "To use the bot inside a channel, you need to invite it first:\n" +
            "1. Go to the channel.\n" +
            "2. Type `@Emojize` and select the bot from the menu.\n" +
            "3. Slack will ask if you want to add the app — confirm it.\n\n" +
            "After that, you can use slash commands in the channel, and Emojize will respond normally!"
        }
      },

      { type: "divider" },

      // --- Model Overview Block ---
      {
        type: "section",
        text: { type: "mrkdwn", text: `*🧭 Model Overview*\n${modelDescriptionsMarkdown}` },
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

      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: " " }
        ]
      },
    ]
    const historyTabBlocks = [
        {
            type: "header",
            text: { type: "plain_text", text: "Your Translation History" }
        },
        ...historyBlocks
    ];

    // Select content based on mode
    const content = isHistory ? historyTabBlocks : overviewBlocks;


  return {
    type: "home",
    blocks: [
      {
        type: "actions",
        elements: [
            {
                type: "button",
                text: { type: "plain_text", text: "Overview" },
                action_id: "nav_overview",
                ...(mode === "overview" ? { style: "primary" } : {})
            },
            {
                type: "button",
                text: { type: "plain_text", text: "History" },
                action_id: "nav_history",
                ...(mode === "history" ? { style: "primary" } : {})
            }
        ]
      },

        { type: "divider" },
            ...content
      ]
  };
}

module.exports = { buildHomeView };