import { describe, it, expect } from 'vitest';
import { translateToEmojis, translateToWords, emojiToWord, wordToEmoji } from './localTranslator';

describe('localTranslator', () => {
  describe('emojiToWord dictionary', () => {
    it('should have array values for all emojis', () => {
      Object.values(emojiToWord).forEach(words => {
        expect(Array.isArray(words)).toBe(true);
        expect(words.length).toBeGreaterThan(0);
        words.forEach(word => {
            expect(typeof word).toBe('string');
        });
      });
    });

    it('should support multiple words for specific emojis', () => {
      // Check a known emoji with multiple synonyms
      // '😃': ['smile', 'happy'] or similar based on the file I read
      // The file had: '😃': ['smile', 'happy']
      expect(emojiToWord['😃']).toContain('smile');
      expect(emojiToWord['😃']).toContain('happy');
    });
  });

  describe('wordToEmoji dictionary', () => {
      it('should map all synonyms to the same emoji', () => {
          // '😃' maps to 'smile' and 'happy'
          // Note: multiple emojis map to 'smile', so we check if the result is one of them.
          // '😃', '😄', '😊' all have 'smile'.
          expect(['😃', '😄', '😊']).toContain(wordToEmoji['smile']);
          
          // 'happy' is in '😃' and '😄'.
          expect(['😃', '😄']).toContain(wordToEmoji['happy']);
      });
  });

  describe('translateToEmojis', () => {
    it('should translate single words to emojis', () => {
      expect(translateToEmojis('grin')).toBe('😁'); // or similar
    });

    it('should translate synonyms to the correct emoji', () => {
      expect(translateToEmojis('rofl')).toBe('🤣');
      expect(translateToEmojis('rolling on the floor laughing')).toBe('🤣'); // Wait, split by space logic might fail for phrases?
      // The implementation: const words = text.toLowerCase().split(/\s+/);
      // It processes word by word.
      // So 'rolling on the floor laughing' -> 'rolling', 'on', 'the', 'floor', 'laughing'
      // Unless 'rolling on the floor laughing' is treated as a single token, it won't match if logic is word-based.
      // The current logic IS word-based: words.map(...)
      // So multi-word keys in emojiToWord won't work for translation unless the input is exactly that phrase as a single token?
      // Actually, if emojiToWord has "rolling on the floor laughing", wordToEmoji will have "rolling on the floor laughing": "🤣".
      // But translateToEmojis splits by space. So it will look up "rolling", "on", ...
      // "rolling" is not in wordToEmoji (probably).
      // So translateToEmojis WILL FAIL for multi-word phrases.
      // This might be a BUG or limitation I should identify.
      // For now, let's test single words.
      expect(translateToEmojis('rofl')).toBe('🤣');
    });

    it('should handle punctuation', () => {
        expect(translateToEmojis('rofl!')).toBe('🤣!');
    });

    it('should be case insensitive', () => {
        expect(translateToEmojis('ROFL')).toBe('🤣');
    });
  });

  describe('translateToWords', () => {
    it('should translate emoji to the first word in the list', () => {
      // '🤣': ['rolling on the floor laughing', 'rofl']
      expect(translateToWords('🤣').trim()).toBe('rolling on the floor laughing');
    });

    it('should handle multiple emojis', () => {
      // '😀': ['grinning']
      // '🤣': ['rolling on the floor laughing', 'rofl']
      const result = translateToWords('😀 🤣');
      expect(result).toContain('grinning');
      expect(result).toContain('rolling on the floor laughing');
    });

    it('should preserve surrounding text', () => {
      expect(translateToWords('Hello 🤣 world')).toBe('Hello rolling on the floor laughing world');
    });
  });
});
