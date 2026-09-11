import { describe, expect, it } from 'vitest';
import { pronounce, setNameSound, voiceScore } from './sound';

describe('voices', () => {
  it('prefers downloaded British voices and skips novelty and non-English ones', () => {
    const ranked = [
      { name: 'Samantha', lang: 'en-US' },
      { name: 'Serena (Premium)', lang: 'en-GB' },
      { name: 'Daniel', lang: 'en-GB' },
      { name: 'Stephanie (Enhanced)', lang: 'en-GB' },
      { name: 'Zarvox', lang: 'en-US' },
      { name: 'Amélie', lang: 'fr-CA' },
    ]
      .filter((v) => voiceScore(v) >= 0)
      .sort((a, b) => voiceScore(b) - voiceScore(a))
      .map((v) => v.name);
    expect(ranked).toEqual(['Serena (Premium)', 'Stephanie (Enhanced)', 'Daniel', 'Samantha']);
  });
});

describe('name pronunciation', () => {
  it('swaps the name for how it sounds, as a whole word', () => {
    setNameSound('Tara', 'Tah-ra');
    expect(pronounce('Well done Tara! Clever tara!')).toBe('Well done Tah-ra! Clever Tah-ra!');
    expect(pronounce('Tarantula')).toBe('Tarantula');
    setNameSound('Tara', '  ');
    expect(pronounce('Well done Tara!')).toBe('Well done Tara!');
  });
});
