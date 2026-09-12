import { describe, expect, it } from 'vitest';
import type { RoundRecord } from '@/features/games/engine';
import { emptyProgress, type Progress, type StickerRecord } from '@/features/progress/model';
import { gardenNews, gardenOf, GARDEN_SIZE } from './garden-state';

const NOW = new Date('2026-09-12T18:00:00Z');

const round = (id: string, score: number, hoursAgo: number, level = 0): RoundRecord => ({
  id,
  childId: 'tara',
  game: 'peek',
  level,
  score,
  total: 5,
  answers: [],
  playedAt: new Date(NOW.getTime() - hoursAgo * 3600_000).toISOString(),
});

const stickers = (n: number): StickerRecord[] =>
  Array.from({ length: n }, (_, i) => ({ id: `s${i}`, childId: 'tara', sticker: 'unicorn/rainbow', shiny: false, roundId: null, earnedAt: NOW.toISOString() }));

const progress = (rounds: RoundRecord[], stickerCount = 0): Progress => ({ ...emptyProgress(), rounds, stickers: stickers(stickerCount) });

describe('garden', () => {
  it('plants a flower per finished round, open as wide as the round was good', () => {
    const garden = gardenOf(progress([round('a', 5, 3), round('b', 4, 2), round('c', 3, 1)]), NOW);
    expect(garden.rounds).toBe(3);
    const blooms = new Map(garden.plants.map((p) => [p.id, p.bloom]));
    expect([blooms.get('a'), blooms.get('b'), blooms.get('c')]).toEqual([3, 2, 1]);
    expect(garden.plants.filter((p) => p.fresh).map((p) => p.id)).toEqual(['c']);
  });

  it('ignores rounds left early and keeps the bed to its size', () => {
    const many = Array.from({ length: GARDEN_SIZE + 5 }, (_, i) => round(`r${i}`, 5, GARDEN_SIZE + 5 - i));
    const garden = gardenOf(progress([...many, { ...round('quit', 1, 0), completed: false }]), NOW);
    expect(garden.plants).toHaveLength(GARDEN_SIZE);
    expect(garden.plants.some((p) => p.id === 'r0')).toBe(false);
    expect(garden.rounds).toBe(GARDEN_SIZE + 5);
  });

  it('puts every flower in the same place every time', () => {
    const p = progress([round('a', 5, 3), round('b', 3, 1)]);
    expect(gardenOf(p, NOW).plants).toEqual(gardenOf(p, NOW).plants);
  });

  it('adds a butterfly per ten stickers, a rainbow for the daily goal and a unicorn at fifty', () => {
    const today = [round('a', 5, 3), round('b', 5, 2), round('c', 5, 1)];
    expect(gardenOf(progress(today, 25), NOW)).toMatchObject({ butterflies: 2, rainbow: true, unicorn: false, toNextButterfly: 5 });
    expect(gardenOf(progress([round('a', 5, 40)], 50), NOW)).toMatchObject({ rainbow: false, unicorn: true });
  });

  it('says what changed after a round', () => {
    const before = gardenOf(progress([round('a', 5, 3)], 9), NOW);
    expect(gardenNews(before, gardenOf(progress([round('a', 5, 3), round('b', 5, 1)], 9), NOW))).toMatch(/big new flower/);
    expect(gardenNews(before, gardenOf(progress([round('a', 5, 3), round('b', 3, 1)], 10), NOW))).toMatch(/butterfly/);
    expect(gardenNews(before, before)).toBe(null);
  });
});
