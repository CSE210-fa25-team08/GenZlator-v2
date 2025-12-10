// translateFallback.test.js

// Mock semantic dictionary and slack shortcode map
jest.mock("../src/utils/semanticDictionary", () => ({
    wordToEmoji: {
      "hello": ["👋"],
      "good morning": ["🌅"],
      "cat": ["🐱"],
      "dog": ["🐶"]
    },
    emojiToSemantic: {
      "🐱": { canonical: "cat" },
      "🐶": { canonical: "dog" }
    }
  }));
  
  jest.mock("../src/storage/slackShortcodeToWord", () => ({
    smile: "happy",
    cry: "sad"
  }));
  
  const { translateToEmojis, translateToWords } = require("../src/utils/translateFallback");
  
  describe("translateToEmojis()", () => {
  
    test("exact match → emoji", () => {
        expect(translateToEmojis("hello")).toBe("👋");
      });
      
    test("multi-word exact match", () => {
    expect(translateToEmojis("good morning")).toBe("🌅");
    });
      
  
    test("keeps punctuation with emoji", () => {
      expect(translateToEmojis("hello!")).toBe("👋!");
    });
  
    test("subset match should work", () => {
      // "good morning" contains "morning" as a phrase? 
      // Use custom dictionary if needed — for now we test fuzzy.
      expect(translateToEmojis("good morning everyone")).toContain("🌅");
    });
  
    test("fuzzy match: 'helo' → 'hello' → 👋", () => {
      expect(translateToEmojis("helo")).toBe("👋");
    });
  
    test("returns original word if no match", () => {
      expect(translateToEmojis("unknownword")).toBe("unknownword");
    });
  
    test("handles multiple words", () => {
      expect(translateToEmojis("hello cat dog")).toBe("👋 🐱 🐶");
    });
  
    test("empty string → empty string", () => {
      expect(translateToEmojis("")).toBe("");
    });
  
  });
  
  describe("translateToWords()", () => {
  
    test("unicode emoji → canonical word", () => {
      expect(translateToWords("🐱")).toBe("cat");
      expect(translateToWords("🐶")).toBe("dog");
    });
  
    test("Slack shortcode → word", () => {
      expect(translateToWords(":smile:")).toBe("happy");
      expect(translateToWords(":cry:")).toBe("sad");
    });
  
    test("mixed emojis + text", () => {
      expect(translateToWords("hello 🐱 world")).toBe("hello cat world");
    });
  
    test("unknown unicode emoji → keep as is", () => {
      expect(translateToWords("😀")).toBe("😀");  // not in emojiToSemantic mock
    });
  
    test("trims excessive spaces", () => {
      expect(translateToWords("🐱   :smile:  ")).toBe("cat happy");
    });
  
    test("empty input → empty", () => {
      expect(translateToWords("")).toBe("");
    });
    
    console.log(translateToEmojis("hello"), translateToEmojis("hello").length);

  
  });

  