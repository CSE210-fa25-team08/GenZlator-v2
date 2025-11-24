// utils/chatHistory.js

async function getLastTwoMessages(client, body) {
    const channelId = body.channel?.id;
    
    try {
        const history = await client.conversations.history({
            channel: channelId,
            limit: 3
        });

        return history.messages
            .filter(m => m.type === "message" && !m.subtype)
            .map(m => m.text)
            .slice(0, 2);

    } catch (err) {
        // bot can't read the history in privete DM 
        console.log("Failed to fetch history:", err.data?.error);
        // No fallback — DM doesn't need special handling
        return [];
    }
}


module.exports = { getLastTwoMessages };
