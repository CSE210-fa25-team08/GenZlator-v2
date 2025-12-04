const { modelMap } = require("./model");

// --- Helper: build App Home view ---
// markdown for Slack App Home
// I move it here in order to reduce code duplication
// might change in future
function buildHomeView(mode, currentModel, historyBlocks) {
    const selected = modelMap[currentModel] || modelMap.default;
    const isHistory = mode === "history";
    const modelDescriptions = `
    *Model Overview*

    • *mistralai/mistral-7b-instruct*  
      A lightweight, fast model suitable for most general text-to-emoji or emoji-to-text conversions.  
      It performs well for everyday messages and delivers stable, predictable outputs with low latency.

    • *deepseek/deepseek-r1*  
      A reasoning-focused model.  
      It tends to analyze the text more deeply and can produce more accurate translations for longer or more context-heavy inputs.

    • *deepseek/deepseek-r1-distill-llama-70b*  
      A distilled version of a larger reasoning model.  
      It preserves much of the high-quality output of a 70B model but reduces inference time, making it a strong choice when accuracy matters.

    • *cognitivecomputations/dolphin3.0-mistral-24b*  
      A larger, instruction-tuned model designed for nuanced text understanding.  
      It often produces richer interpretations of meaning and is suitable if you want more expressive conversions.

    • *cognitivecomputations/dolphin-mistral-24b-venice-edition*  
      A variant optimized for polished and stylistically consistent responses.  
      It emphasizes clarity and coherence, making it helpful when translating content that needs to be clearer or more refined.
    `;

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
          text: `Your current default model: *${selected}*`,
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
          text: `*User Guide*\nUse these slash commands:\n
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

      // --- Model Overview Block ---
      {
        type: "section",
        text: { type: "mrkdwn", text: modelDescriptions },
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