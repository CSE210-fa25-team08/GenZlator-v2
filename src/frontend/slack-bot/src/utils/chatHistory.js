// utils/chatHistory.js

async function getChatHistory(client, channelId) {
    if (!channelId) {
        console.log("⚠️ No channelId provided to getChatHistory()");
        return [];
    }

    try {
        const history = await client.conversations.history({
            channel: channelId,
            limit: 20
        });

        return history.messages
            .filter(m => m.type === "message" && !m.subtype && !m.bot_id)
            .map(m => m.text)
            .slice(0, 2);

    } catch (err) {
        console.log("Failed to fetch history:", err.data?.error);
        return [];
    }
}

module.exports = { getChatHistory };
