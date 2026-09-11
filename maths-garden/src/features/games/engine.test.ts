import { describe, expect, it } from 'vitest';
import { gameById, type GameId } from './catalog';
import { advice, levelOf, nextLevel, oftenMissed, skillStats, weekSummary, type AnswerRecord, type RoundRecord } from './engine';

const round = (game: GameId, level: number, score: number, minute: number, answers: AnswerRecord[] = []): RoundRecord => ({
  id: `r${minute}`,
  childId: 'c',
  game,
  level,
  score,
  total: 5,
  answers,
  playedAt: new Date(Date.UTC(2026, 8, 7, 10, minute)).toISOString(),
});

const peek = gameById('peek');

describe('nextLevel', () => {
  it('moves up straight away after a perfect round', () => {
    expect(nextLevel([round('peek', 0, 5, 1)], peek, 0)).toBe(1);
    expect(nextLevel([round('peek', 0, 5, 1), round('peek', 1, 5, 2)], peek, 1)).toBe(2);
  });

  it('moves up after two rounds in a row at 80%+', () => {
    expect(nextLevel([round('peek', 0, 4, 1), round('peek', 0, 4, 2)], peek, 0)).toBe(1);
  });

  it('needs both 80% rounds at the current level', () => {
    expect(nextLevel([round('peek', 0, 5, 1), round('peek', 1, 4, 2)], peek, 1)).toBe(1);
  });

  it('only looks at the same game, in time order', () => {
    const rounds = [round('peek', 0, 4, 3), round('count', 0, 1, 2), round('peek', 0, 4, 1)];
    expect(nextLevel(rounds, peek, 0)).toBe(1);
  });

  it('stops at the top level', () => {
    const top = peek.levels.length - 1;
    expect(nextLevel([round('peek', top, 5, 1), round('peek', top, 5, 2)], peek, top)).toBe(top);
  });

  it('drops back after two rounds under 50%', () => {
    expect(nextLevel([round('peek', 1, 2, 1), round('peek', 1, 1, 2)], peek, 1)).toBe(0);
    expect(nextLevel([round('peek', 0, 0, 1), round('peek', 0, 1, 2)], peek, 0)).toBe(0);
  });

  it('holds on a mixed pair', () => {
    expect(nextLevel([round('peek', 1, 5, 1), round('peek', 1, 2, 2)], peek, 1)).toBe(1);
  });
});

describe('levelOf', () => {
  it('defaults to 0 and clamps overrides to the game', () => {
    expect(levelOf({}, peek)).toBe(0);
    expect(levelOf({ peek: 9 }, peek)).toBe(peek.levels.length - 1);
  });
});

describe('skillStats and advice', () => {
  it('averages the last three rounds', () => {
    const rounds = [round('peek', 0, 0, 1), round('peek', 0, 5, 2), round('peek', 0, 4, 3), round('peek', 0, 3, 4)];
    expect(skillStats(rounds, 'peek')).toEqual({ pct: 80, rounds: 3 });
    expect(skillStats(rounds, 'count')).toBeNull();
  });

  it('matches the iteration rule', () => {
    expect(advice(null, 0, peek)).toMatch(/not played/i);
    expect(advice({ pct: 90, rounds: 3 }, 0, peek)).toMatch(/moves up/);
    expect(advice({ pct: 90, rounds: 3 }, peek.levels.length - 1, peek)).toMatch(/top level/i);
    expect(advice({ pct: 60, rounds: 3 }, 1, peek)).toMatch(/keep practising/i);
    expect(advice({ pct: 40, rounds: 3 }, 1, peek)).toMatch(/real objects/);
  });
});

describe('oftenMissed', () => {
  it('ranks wrong targets by count', () => {
    const miss = (target: string): AnswerRecord => ({ target, chosen: '0', correct: false, ms: 1000 });
    const hit = (target: string): AnswerRecord => ({ target, chosen: target, correct: true, ms: 1000 });
    const rounds = [round('find', 1, 2, 1, [miss('6'), miss('9'), hit('3')]), round('find', 1, 3, 2, [miss('6'), hit('9')])];
    expect(oftenMissed(rounds, 'find')).toEqual([
      { target: '6', count: 2 },
      { target: '9', count: 1 },
    ]);
  });
});

describe('weekSummary', () => {
  it('counts rounds, days and minutes in the last seven days', () => {
    const answers = Array.from({ length: 5 }, () => ({ target: '1', chosen: '1', correct: true, ms: 6000 }));
    const rounds = [
      { ...round('peek', 0, 5, 1, answers), playedAt: '2026-09-10T09:00:00Z' },
      { ...round('peek', 0, 5, 2, answers), playedAt: '2026-09-10T09:05:00Z' },
      { ...round('peek', 0, 5, 3, answers), playedAt: '2026-09-08T09:00:00Z' },
      { ...round('peek', 0, 5, 4, answers), playedAt: '2026-08-20T09:00:00Z' },
    ];
    expect(weekSummary(rounds, new Date('2026-09-11T12:00:00Z'))).toEqual({ rounds: 3, days: 2, minutes: 2 });
  });
});
