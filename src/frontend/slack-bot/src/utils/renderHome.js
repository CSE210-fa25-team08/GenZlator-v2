const { getHistory } = require("../storage/history");
const { buildHomeView } = require("./homeView");
const { getUserModel } = require("../utils/model");

async function renderHome(client, userId, mode) {
    const history = getHistory(userId);
    const currentModel = getUserModel(userId);

    console.log("Rendering home for user:", userId, "mode:", mode);

    const emojiNumbers = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];

    const historyBlocks =
        history.length === 0
            ? [
                  {
                      type: "section",
                      text: { type: "mrkdwn", text: "No history yet." }
                  }
              ]
            : history.slice(-10).map((h, i) => {
              const num = emojiNumbers[i] || "🔢"; 

              return {
                  type: "section",
                  text: {
                      type: "mrkdwn",
                      text:
                          `${num}  *${h.direction}* • \`${h.timestamp}\`\n` +
                          `• *Original Text:* ${h.original}\n` +
                          `• *Translated:* ${h.translated}`
                  }
              };
          });


    await client.views.publish({
        user_id: userId,
        view: buildHomeView(mode, currentModel, historyBlocks)
    });

    console.log("Published home view for user:", userId);
}

module.exports = { renderHome };