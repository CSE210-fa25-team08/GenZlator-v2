const { getHistory } = require("../storage/history");
const { buildHomeView } = require("./homeView");
const { getUserModel } = require("../utils/model");

async function renderHome(client, userId, mode) {
    const history = getHistory(userId);
    const currentModel = getUserModel(userId);

    console.log("Rendering home for user:", userId, "mode:", mode);

    const historyBlocks =
        history.length === 0
            ? [
                  {
                      type: "section",
                      text: { type: "mrkdwn", text: "No history yet." }
                  }
              ]
            : history.slice(-10).map(h => ({
                  type: "section",
                  text: {
                      type: "mrkdwn",
                      text:
                          `*${h.direction}* • \`${h.timestamp}\`\n` +
                          `• *Original:* ${h.original}\n` +
                          `• *Translated:* ${h.translated}`
                  }
              }));

    console.log("History blocks:", historyBlocks);

    await client.views.publish({
        user_id: userId,
        view: buildHomeView(mode, currentModel, historyBlocks)
    });

    console.log("Published home view for user:", userId);
}

module.exports = { renderHome };