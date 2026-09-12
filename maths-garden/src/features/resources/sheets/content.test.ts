import { describe, expect, it } from 'vitest';
import { SHEETS } from './catalog';
import { buildPairs, buildStories, PAIRS, scatterSpots, STORIES } from './content';

const STAGES = [1, 2, 3] as const;

describe('sheet content', () => {
  it('builds comparison pairs for every stage, with exactly one matching pair', () => {
    for (const stage of STAGES) {
      const { from, to } = SHEETS['more-or-fewer'].stages[stage];
      const pairs = buildPairs(from, to, stage);
      expect(pairs).toHaveLength(PAIRS);
      expect(pairs.filter(([a, b]) => a === b)).toHaveLength(1);
      expect(pairs.every(([a, b]) => a >= from && a <= to && b >= from && b <= to)).toBe(true);
      // Stage 1 differences have to be obvious.
      if (stage === 1) expect(pairs.filter(([a, b]) => a !== b).every(([a, b]) => Math.abs(a - b) >= 2)).toBe(true);
      expect(buildPairs(from, to, stage)).toEqual(pairs);
    }
  });

  it('only asks for story lines that exist at the stage, and keeps every total in range', () => {
    for (const stage of STAGES) {
      const { to } = SHEETS['unicorn-stories'].stages[stage];
      const stories = buildStories(to, stage);
      expect(stories.length).toBeGreaterThan(0);
      expect(stories.length).toBeLessThanOrEqual(STORIES);
      expect(stories.every(([start, extra]) => start >= 1 && extra >= 1 && start + extra <= to)).toBe(true);
      expect(new Set(stories.map(String)).size).toBe(stories.length);
      expect(buildStories(to, stage)).toEqual(stories);
    }
  });

  it('places every mark in the box without running out of room', () => {
    for (let n = 1; n <= 12; n++) {
      const spots = scatterSpots(n, n * 7);
      expect(spots).toHaveLength(n);
      expect(spots.every((s) => s.x >= 12 && s.x <= 88 && s.y >= 12 && s.y <= 48)).toBe(true);
    }
  });
});
