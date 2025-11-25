const userHistoryMap = {};

function addHistory(userId, record) {
    if (!userHistoryMap[userId]) {
        userHistoryMap[userId] = [];
    }
    userHistoryMap[userId].push(record);
}

function getHistory(userId) {
    return userHistoryMap[userId] || [];
}

function clearHistory(userId) {
    userHistoryMap[userId] = [];
}

module.exports = {
    addHistory,
    getHistory,
    clearHistory
};