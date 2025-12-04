// semanticDictionary.js
const emojiToWord = require("../storage/emojiToWord");


const STOPWORDS = new Set([
  'of', 'and', 'the', 'a', 'an', 'to', 'for', 'on', 'in', 'at', 'or', 'by',
  'with', 'without', 'from', 'up', 'down', 'over', 'under'
]);

function buildSemanticFromEmojiToWord(emojiToWord) {
  const emojiToSemantic = {};
  const wordToEmoji = {};

  for (const [emoji, rawLabel] of Object.entries(emojiToWord)) {
    if (!rawLabel) continue;

    const canonical = rawLabel.toLowerCase().trim();

    const tokens = canonical
      .split(/\s+/)
      .map(t => t.trim())
      .filter(t => t && !STOPWORDS.has(t));

    const allSynonyms = Array.from(new Set([canonical, ...tokens]));

    emojiToSemantic[emoji] = {
      canonical,
      synonyms: allSynonyms
    };

    for (const word of allSynonyms) {
      if (!wordToEmoji[word]) {
        wordToEmoji[word] = [];
      }
      if (!wordToEmoji[word].includes(emoji)) {
        wordToEmoji[word].push(emoji);
      }
    }
  }

  return { emojiToSemantic, wordToEmoji };
}

const { emojiToSemantic, wordToEmoji } = buildSemanticFromEmojiToWord(emojiToWord);

module.exports = {
  emojiToWord,
  emojiToSemantic,
  wordToEmoji,
  buildSemanticFromEmojiToWord
};
