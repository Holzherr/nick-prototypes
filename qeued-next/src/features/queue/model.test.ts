import { describe, expect, it } from 'vitest';
import { advance, nextDuel, nextEpisodeLabel, progressFraction, rankFromDuels } from './model';

const duel = (winner: string, loser: string) => ({ winner_title_id: winner, loser_title_id: loser });

describe('rankFromDuels', () => {
  it('leaves everything equal when nothing has been compared', () => {
    const strength = rankFromDuels(['a', 'b', 'c'], []);
    expect(new Set(strength.values()).size).toBe(1);
  });

  it('ranks a consistent winner above a consistent loser', () => {
    const strength = rankFromDuels(['a', 'b'], [duel('a', 'b'), duel('a', 'b')]);
    expect(strength.get('a')!).toBeGreaterThan(strength.get('b')!);
  });

  it('orders a transitive chain correctly', () => {
    const strength = rankFromDuels(['a', 'b', 'c'], [duel('a', 'b'), duel('b', 'c'), duel('a', 'c')]);
    expect(strength.get('a')!).toBeGreaterThan(strength.get('b')!);
    expect(strength.get('b')!).toBeGreaterThan(strength.get('c')!);
  });

  it('ignores duels about titles no longer in the queue', () => {
    expect(() => rankFromDuels(['a'], [duel('x', 'y')])).not.toThrow();
  });

  it('keeps an uncompared title off the bottom', () => {
    const strength = rankFromDuels(['a', 'b', 'fresh'], [duel('a', 'b'), duel('a', 'b')]);
    expect(strength.get('fresh')!).toBeGreaterThan(strength.get('b')!);
  });
});

describe('nextDuel', () => {
  it('returns null when there is nothing to compare', () => {
    expect(nextDuel(['only'], [])).toBeNull();
  });

  it('never repeats a pair that has already met', () => {
    const pair = nextDuel(['a', 'b', 'c'], [duel('a', 'b')]);
    expect(pair!.sort().join('|')).not.toBe('a|b');
  });

  it('prefers the least-compared titles', () => {
    const duels = [duel('a', 'b'), duel('a', 'c'), duel('b', 'c')];
    const pair = nextDuel(['a', 'b', 'c', 'd'], duels);
    expect(pair).toContain('d');
  });

  it('returns null once every pair has met', () => {
    expect(nextDuel(['a', 'b'], [duel('a', 'b')])).toBeNull();
  });
});

describe('nextEpisodeLabel', () => {
  it('is null before anything is watched', () => {
    expect(nextEpisodeLabel({ current_season: null, current_episode: null })).toBeNull();
  });

  it('points at the episode after the one watched', () => {
    expect(nextEpisodeLabel({ current_season: 2, current_episode: 3 })).toBe('S2 E4');
  });

  it('starts a known season at episode one', () => {
    expect(nextEpisodeLabel({ current_season: 3, current_episode: null })).toBe('S3 E1');
  });
});

describe('progressFraction', () => {
  it('refuses to guess without a total', () => {
    expect(progressFraction({ current_season: 1, current_episode: 3 })).toBeNull();
  });

  it('reports part-way through', () => {
    const fraction = progressFraction({ current_season: 1, current_episode: 5, seasons: 2, episodes: 20 });
    expect(fraction).toBeCloseTo(0.25);
  });

  it('never exceeds one', () => {
    expect(progressFraction({ current_season: 9, current_episode: 99, seasons: 2, episodes: 20 })).toBe(1);
  });
});

describe('advance', () => {
  it('starts an unwatched series at the first episode', () => {
    expect(advance({ current_season: null, current_episode: null })).toEqual({ current_season: 1, current_episode: 1 });
  });

  it('steps to the next episode', () => {
    expect(advance({ current_season: 1, current_episode: 4, seasons: 2, episodes: 20 })).toEqual({ current_season: 1, current_episode: 5 });
  });

  it('rolls into the next season at the end of one', () => {
    expect(advance({ current_season: 1, current_episode: 10, seasons: 2, episodes: 20 })).toEqual({ current_season: 2, current_episode: 1 });
  });

  it('stays on the last season rather than inventing one', () => {
    expect(advance({ current_season: 2, current_episode: 10, seasons: 2, episodes: 20 })).toEqual({ current_season: 2, current_episode: 11 });
  });
});
