// map of style key → label shown in UI
// might be deleted in future
// change to model names later
// for /api/v1/models compatibility
const styleMap = {
  default: "✨ Default",
  cute: "🐰 Cute",
  funny: "😂 Funny",
  formal: "💼 Formal",
};

// simple in-memory store for user default styles
// { userId: "default" | "cute" | "funny" | "formal" }
const userDefaultStyles = {};


function getUserStyle(userId) {
  return userDefaultStyles[userId] || "default";
}

function setUserStyle(userId, style) {
  userDefaultStyles[userId] = style;
}

module.exports = {
  styleMap,
  getUserStyle,
  setUserStyle,
};