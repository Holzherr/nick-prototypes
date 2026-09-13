import { describe, expect, it } from 'vitest';
import { gameById, type GameId } from './catalog';
import { advice, levelOf, mastered, nextLevel, oftenMissed, shouldEase, skillStats, speedOf, streakOf, weekSummary, type AnswerRecord, type RoundRecord } from './engine';

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
const topLevel = peek.levels.length - 1;
const ans = (ms: number, correct = true): AnswerRecord => ({ target: '3', chosen: correct ? '3' : '2', correct, ms });
const slowAnswers = Array.from({ length: 5 }, () => ans(9000));
const quickAnswers = Array.from({ length: 5 }, () => ans(1500));

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

describe('speed and within-round rules', () => {
  const answered = (ms: number, correct = true): AnswerRecord => ({ target: '3', chosen: correct ? '3' : '2', correct, ms });
  const slow = Array.from({ length: 5 }, () => answered(9000));

  it('holds an accurate but slow round', () => {
    expect(nextLevel([round('peek', 0, 5, 1, slow)], peek, 0)).toBe(0);
    expect(nextLevel([round('peek', 0, 4, 1, slow), round('peek', 0, 4, 2, slow)], peek, 0)).toBe(0);
    expect(nextLevel([round('peek', 0, 5, 1, Array.from({ length: 5 }, () => answered(1500)))], peek, 0)).toBe(1);
  });

  it('ignores rounds left early', () => {
    expect(nextLevel([round('peek', 0, 4, 1), { ...round('peek', 0, 5, 2), completed: false }], peek, 0)).toBe(0);
    expect(skillStats([{ ...round('count', 0, 0, 1), completed: false }], 'count')).toBeNull();
  });

  it('measures pace against the target', () => {
    expect(speedOf([round('peek', 0, 3, 1, [answered(1000), answered(2000), answered(3000), answered(9000, false)])])).toEqual({ ms: 2000, ratio: 0.8, pace: 'fluent' });
  });

  it('eases after two misses and counts streaks', () => {
    expect(shouldEase([answered(1000), answered(1000, false), answered(1000, false)])).toBe(true);
    expect(shouldEase([answered(1000, false), answered(1000)])).toBe(false);
    expect(streakOf([answered(1000, false), answered(1000), answered(1000), answered(1000)])).toBe(3);
  });
});

/**
 * She played 55 rounds at 94% and moved up seven times. Being accurate but slow held a level indefinitely,
 * which is the right nudge for a round or two and a trap for ever.
 */
describe('not holding an accurate child back', () => {
  it('lets a slow perfect round through when the round before it was not slow', () => {
    // On its own a slow perfect round still waits: one round says nothing about pace either way.
    expect(nextLevel([round('peek', 0, 5, 1, slowAnswers)], peek, 0)).toBe(0);
    expect(nextLevel([round('peek', 0, 4, 1, quickAnswers), round('peek', 0, 5, 2, slowAnswers)], peek, 0)).toBe(1);
    expect(nextLevel([round('peek', 0, 4, 1, slowAnswers), round('peek', 0, 5, 2, slowAnswers)], peek, 0)).toBe(0);
  });

  it('moves up after four good rounds in a row however slow they were', () => {
    const four = [1, 2, 3, 4].map((minute) => round('peek', 0, 4, minute, slowAnswers));
    expect(nextLevel(four, peek, 0)).toBe(1);
    // Three is not enough: the two-in-a-row rule still holds a pair of slow rounds back.
    expect(nextLevel(four.slice(0, 3), peek, 0)).toBe(0);
  });

  it('never moves up on four rounds that were not all good, and still drops back', () => {
    const mixed = [round('peek', 1, 4, 1), round('peek', 1, 2, 2), round('peek', 1, 4, 3), round('peek', 1, 3, 4)];
    expect(nextLevel(mixed, peek, 1)).toBe(1);
    expect(nextLevel([round('peek', 1, 2, 1), round('peek', 1, 1, 2)], peek, 1)).toBe(0);
  });
});

/** The top level used to be the end of the game, with nothing on the child's screen to say so. */
describe('mastered', () => {
  it('needs a perfect round at the top level, not merely reaching it', () => {
    expect(mastered([round('peek', topLevel, 4, 1, quickAnswers)], peek)).toBe(false);
    expect(mastered([round('peek', topLevel, 5, 1, quickAnswers)], peek)).toBe(true);
    expect(mastered([round('peek', topLevel, 5, 1, slowAnswers)], peek)).toBe(false);
    expect(mastered([round('peek', topLevel - 1, 5, 1, quickAnswers)], peek)).toBe(false);
  });

  it('ignores rounds left early, and stays true once earned', () => {
    expect(mastered([{ ...round('peek', topLevel, 5, 1, quickAnswers), completed: false }], peek)).toBe(false);
    expect(mastered([round('peek', topLevel, 5, 1, quickAnswers), round('peek', topLevel, 1, 2, slowAnswers)], peek)).toBe(true);
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
    expect(weekSummary(rounds, new Date('2026-09-11T12:00:00Z'))).toEqual({ rounds: 3, quit: 0, days: 2, minutes: 2 });
  });
});
