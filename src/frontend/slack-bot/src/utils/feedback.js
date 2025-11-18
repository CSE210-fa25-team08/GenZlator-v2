// --- Helper: build feedback blocks ---
// markdown for feedback component
// I move it here in order to reduce code duplication
// might change in future
function buildFeedbackBlocks(text) {
  return [
    {
      type: "section",
      text: { type: "mrkdwn", text: "*Do you like this translation?*" },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Yes" },
          style: "primary",
          action_id: "feedback_yes",
          value: text || "yes",    // 保證非空
        },
        {
          type: "button",
          text: { type: "plain_text", text: "No" },
          style: "danger",
          action_id: "feedback_no",
          value: text || "no",     // 保證非空
        },
      ],
    },
  ];
}


module.exports = { buildFeedbackBlocks };