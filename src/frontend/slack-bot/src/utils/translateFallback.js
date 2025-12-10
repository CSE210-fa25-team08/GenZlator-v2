//  Fallback Semantic Emoji Translator (Slack-ready)
//  CommonJS version — No import, No ESM

const { emojiToSemantic, wordToEmoji } = require('./semanticDictionary');
const slackShortcodeToWord = require('../storage/slackShortcodeToWord');
const slackEmojiRegex = /:([a-zA-Z0-9_+~-]+):/g;

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[a.length][b.length];
}

function findSubsetEmoji(phrase) {
  let bestMatchEmoji = null;
  let shortestKeyLength = Infinity;

  for (const [key, emojis] of Object.entries(wordToEmoji)) {
    const emoji = Array.isArray(emojis) ? emojis[0] : emojis;
    if (new RegExp(`\\b${phrase}\\b`, 'i').test(key) && key !== phrase) {
      if (key.length < shortestKeyLength) {
        shortestKeyLength = key.length;
        bestMatchEmoji = emoji;
      }
    }
  }

  return bestMatchEmoji;
}

function findClosestEmoji(phrase, maxDistance = 2) {
  const target = phrase.toLowerCase();
  let bestEmoji = null;
  let bestDist = Infinity;

  for (const [word, emojis] of Object.entries(wordToEmoji)) {
    const dist = levenshtein(target, word);
    if (dist < bestDist && dist <= maxDistance) {
      bestDist = dist;
      bestEmoji = emojis[0]; 
    }
  }

  return bestEmoji;
}

function translateToEmojis(text) {
  if (!text.trim()) return '';

  const words = text.toLowerCase().split(/\s+/);
  const result = [];
  let i = 0;

  while (i < words.length) {
    let matched = false;

    for (let phraseLength = Math.min(6, words.length - i); phraseLength >= 1; phraseLength--) {
      const phrase = words.slice(i, i + phraseLength).join(' ');
      const cleanPhrase = phrase.replace(/[.,!?;:]$/, '');
      const punctuation = phrase.match(/[.,!?;:]$/) || [''];

      // 1. exact match
      if (wordToEmoji[cleanPhrase]) {
        const emojiList = wordToEmoji[cleanPhrase];
        const chosen = Array.isArray(emojiList) ? emojiList[0] : emojiList;

        result.push(chosen + punctuation[0]);
        i += phraseLength;    // EXACT SAME BEHAVIOR AS SUBSET/FUZZY
        matched = true;       // MARK AS MATCHED
        break;                // STOP FURTHER MATCHING!!
      }


      // 2. subset match
      const subsetMatch = findSubsetEmoji(cleanPhrase);
      if (subsetMatch) {
        result.push(subsetMatch + punctuation[0]);
        i += phraseLength;
        matched = true;
        break;
      }

      // 3. fuzzy match
      const fuzzyMatch = findClosestEmoji(cleanPhrase);
      if (fuzzyMatch) {
        result.push(fuzzyMatch + punctuation[0]);
        i += phraseLength;
        matched = true;
        break;
      }
    }

    if (!matched) {
      result.push(words[i]);
      i++;
    }
  }

  return result.join(' ');
}

function translateToWords(text) {
  if (!text.trim()) return '';

  const emojiRegex =
    /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;

  // Step 1: unicode emoji
  text = text.replace(emojiRegex, (emoji) => {
    return emojiToSemantic[emoji]
      ? ` ${emojiToSemantic[emoji].canonical} `
      : emoji;
  });

  // Step 2: Slack :shortcode:
  text = text.replace(slackEmojiRegex, (match, code) => {
    if (slackShortcodeToWord[code]) {
      return ` ${slackShortcodeToWord[code]} `;
    }
    return match;
  });

  return text.replace(/\s+/g, ' ').trim();
}


module.exports = {
  translateToEmojis,
  translateToWords,
};
