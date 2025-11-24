// utils/chatHistory.js

// async function getLastTwoMessages(client, body) {
//     const channelId = body.channel?.id;
    
//     try {
//         const history = await client.conversations.history({
//             channel: channelId,
//             limit: 3
//         });

//         return history.messages
//             .filter(m => m.type === "message" && !m.subtype)
//             .map(m => m.text)
//             .slice(0, 2);

//     } catch (err) {
//         // bot can't read the history in privete DM 
//         console.log("Failed to fetch history:", err.data?.error);
//         // No fallback — DM doesn't need special handling
//         return [];
//     }
// }


// utils/chatHistory.js

async function getChatHistory(client, channelId) {
    if (!channelId) {
        console.log("⚠️ No channelId provided to getChatHistory()");
        return [];
    }

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
        console.log("Failed to fetch history:", err.data?.error);
        return [];
    }
}

module.exports = { getChatHistory };


// module.exports = { getLastTwoMessages };
