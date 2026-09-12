import { describe, expect, it } from 'vitest';
import { gameById, GAMES, type GameId } from '@/features/games/catalog';
import type { RoundRecord } from '@/features/games/engine';
import { activityByDay, historySummary, levelChanges, levelTimeline, masteryByTarget, weeklyAccuracy, weeklySpeed } from './history';
import { emptyProgress, levelChange, type LevelEvent, type Progress } from './model';

const NOW = new Date('2026-09-12T18:00:00Z');
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 24 * 3600_000).toISOString();

const round = (id: string, game: GameId, level: number, score: number, days: number, ms = 2000): RoundRecord => ({
  id,
  childId: 'tara',
  game,
  level,
  score,
  total: 5,
  answers: Array.from({ length: 5 }, (_, i) => ({ target: String(i + 1), chosen: i < score ? String(i + 1) : 'x', correct: i < score, ms })),
  playedAt: daysAgo(days),
});

const progress = (rounds: RoundRecord[], extra: Partial<Progress> = {}): Progress => ({ ...emptyProgress(), rounds, ...extra });

describe('progress history', () => {
  it('buckets accuracy by week, leaving empty weeks visible', () => {
    const points = weeklyAccuracy([round('a', 'peek', 0, 5, 1), round('b', 'peek', 0, 3, 2), round('c', 'peek', 0, 1, 20)], 'peek', 4, NOW);
    expect(points).toHaveLength(4);
    expect(points.at(-1)?.value).toBe(80); // 8 of 10 this week
    expect(points.at(-1)?.rounds).toBe(2);
    expect(points.filter((p) => p.value === null).length).toBeGreaterThan(0);
  });

  it('reports median seconds per answer per week', () => {
    const points = weeklySpeed([round('a', 'peek', 0, 5, 1, 3000), round('b', 'peek', 0, 5, 2, 1000)], 'peek', 2, NOW);
    expect(points.at(-1)?.value).toBe(2);
  });

  it('counts rounds per day including days with nothing', () => {
    const days = activityByDay([round('a', 'peek', 0, 5, 0), round('b', 'peek', 0, 4, 0), { ...round('q', 'peek', 0, 1, 1), completed: false }], 7, NOW);
    expect(days).toHaveLength(7);
    expect(days.at(-1)).toMatchObject({ rounds: 2, quit: 0 });
    expect(days.at(-2)).toMatchObject({ rounds: 0, quit: 1 });
    expect(days.filter((d) => d.rounds === 0)).toHaveLength(6);
  });

  it('prefers recorded level events over guessing from rounds', () => {
    const event = levelChange('tara', 'peek', 0, 1, 'earned', daysAgo(3));
    const recorded = progress([round('a', 'peek', 0, 5, 4)], { levelEvents: [event.kind === 'level' && event.event ? event.event : ({} as LevelEvent)] });
    expect(levelChanges(recorded, GAMES)).toHaveLength(1);
    expect(levelChanges(recorded, GAMES)[0].reason).toBe('earned');

    // No events recorded: infer from the level the next round was played at.
    const inferred = levelChanges(progress([round('a', 'peek', 0, 5, 4), round('b', 'peek', 1, 4, 3), round('c', 'peek', 0, 1, 2)]), GAMES);
    expect(inferred.map((e) => [e.from, e.to, e.reason])).toEqual([
      [1, 0, 'dropped'],
      [0, 1, 'earned'],
    ]);
  });

  it('draws a level timeline that ends where the child is now', () => {
    const steps = levelTimeline(progress([round('a', 'peek', 0, 5, 6), round('b', 'peek', 1, 5, 3)], { levels: { peek: 1 } }), gameById('peek'), NOW);
    expect(steps[0].level).toBe(0);
    expect(steps.at(-1)).toMatchObject({ level: 1, at: NOW.toISOString() });
  });

  it('ranks numbers by how well they go, worst first', () => {
    const mastery = masteryByTarget([round('a', 'peek', 0, 2, 1)], 'peek');
    expect(mastery[0].pct).toBe(0);
    expect(mastery.at(-1)?.pct).toBe(100);
    expect(mastery.reduce((sum, m) => sum + m.right + m.wrong, 0)).toBe(5);
  });

  it('summarises the whole history', () => {
    const summary = historySummary(progress([round('a', 'peek', 0, 2, 3), round('b', 'peek', 0, 4, 2), round('c', 'peek', 0, 5, 1)]), GAMES);
    expect(summary).toMatchObject({ rounds: 3, questions: 15, days: 3, bestStreak: 3, movesUp: 0, movesDown: 0 });
    expect(summary.firstTen).toBe(73); // 11 of 15
    expect(summary.lastPlayed).toBe(daysAgo(1));
  });

  it('copes with a child who has played nothing', () => {
    const summary = historySummary(emptyProgress(), GAMES);
    expect(summary).toMatchObject({ rounds: 0, days: 0, bestStreak: 0, firstTen: null, firstPlayed: null });
    expect(levelTimeline(emptyProgress(), gameById('peek'), NOW)).toEqual([]);
    expect(masteryByTarget([], 'peek')).toEqual([]);
  });
});
