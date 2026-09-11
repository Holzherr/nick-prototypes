import { describe, expect, it } from 'vitest';
import { GAMES, type GameId } from './catalog';
import type { AnswerRecord, RoundRecord } from './engine';
import { breakSuggestion, coachingNotes, countingHabit, daysPlayed, isPersonalBest, levelHistory, replayHabit, speedTrend, todaySummary } from './insights';

const NOW = new Date('2026-09-11T17:00:00');
let seq = 0;

const answers = (correct: number, total = 5, ms = 2000, extra: Partial<AnswerRecord> = {}): AnswerRecord[] =>
  Array.from({ length: total }, (_, i) => ({ target: '3', chosen: i < correct ? '3' : '2', correct: i < correct, ms, ...extra }));

const round = (game: GameId, level: number, correct: number, at: string, opts: { ms?: number; completed?: boolean; extra?: Partial<AnswerRecord> } = {}): RoundRecord => ({
  id: `r${++seq}`,
  childId: 'c',
  game,
  level,
  score: correct,
  total: 5,
  answers: answers(correct, 5, opts.ms ?? 2000, opts.extra),
  playedAt: new Date(at).toISOString(),
  completed: opts.completed,
});

describe('today and breaks', () => {
  it('counts finished and quit rounds today', () => {
    const rounds = [round('peek', 0, 5, '2026-09-11T09:00'), round('peek', 0, 4, '2026-09-11T09:05'), round('count', 0, 1, '2026-09-11T09:08', { completed: false }), round('peek', 0, 5, '2026-09-10T09:00')];
    expect(todaySummary(rounds, NOW)).toEqual({ done: 2, quit: 1, goal: 3 });
    expect(daysPlayed(rounds, NOW)).toBe(2);
  });

  it('suggests a break for many rounds, two poor rounds, two quits or a slow-down', () => {
    const many = Array.from({ length: 8 }, (_, i) => round('peek', 0, 5, `2026-09-11T10:${String(i).padStart(2, '0')}`));
    expect(breakSuggestion(many, NOW)).toBe('lots');
    expect(breakSuggestion([round('peek', 0, 2, '2026-09-11T10:00'), round('peek', 0, 1, '2026-09-11T10:05')], NOW)).toBe('struggling');
    expect(breakSuggestion([round('peek', 0, 1, '2026-09-11T10:00', { completed: false }), round('peek', 0, 1, '2026-09-11T10:05', { completed: false })], NOW)).toBe('quitting');
    const slowing = [...[0, 1, 2].map((i) => round('peek', 0, 5, `2026-09-11T10:0${i}`, { ms: 2000 })), round('peek', 0, 5, '2026-09-11T10:09', { ms: 6000 })];
    expect(breakSuggestion(slowing, NOW)).toBe('slowing');
    expect(breakSuggestion([round('peek', 0, 5, '2026-09-11T10:00')], NOW)).toBeNull();
  });
});

describe('speed', () => {
  it('spots a personal best only against at least two earlier rounds at the level', () => {
    const a = round('peek', 1, 5, '2026-09-11T10:00', { ms: 3000 });
    const b = round('peek', 1, 4, '2026-09-11T10:05', { ms: 2600 });
    const best = round('peek', 1, 5, '2026-09-11T10:10', { ms: 2000 });
    expect(isPersonalBest([a, b, best], best)).toBe(true);
    expect(isPersonalBest([a, best], best)).toBe(false);
    expect(isPersonalBest([a, b, round('peek', 1, 5, '2026-09-11T10:10', { ms: 2800 })], round('peek', 1, 5, '2026-09-11T10:10', { ms: 2800 }))).toBe(false);
  });

  it('compares recent answer times with earlier ones', () => {
    const early = [0, 1, 2].map((i) => round('find', 0, 5, `2026-09-10T10:0${i}`, { ms: 5000 }));
    const late = [0, 1, 2].map((i) => round('find', 0, 5, `2026-09-11T10:0${i}`, { ms: 3000 }));
    expect(speedTrend([...early, ...late], 'find')).toEqual({ ms: 3000, pace: 'fluent', change: 'faster' });
    expect(speedTrend(late, 'find').change).toBeNull();
  });
});

describe('habits and history', () => {
  it('measures touch-counting and replays', () => {
    const counted = round('count', 0, 5, '2026-09-11T10:00', { extra: { counted: 3, taps: 4 } });
    const guessed = round('count', 0, 5, '2026-09-11T10:05', { extra: { counted: 0, taps: 0 } });
    expect(countingHabit([counted, guessed])).toEqual({ questions: 10, countedAllPct: 50, tapsPerQuestion: 2 });
    expect(replayHabit([round('find', 0, 5, '2026-09-11T10:00', { extra: { replays: 2 } })])).toEqual({ questions: 5, perQuestion: 2 });
    expect(countingHabit([])).toBeNull();
  });

  it('lists level moves newest first', () => {
    const rounds = [round('peek', 0, 5, '2026-09-11T10:00'), round('peek', 1, 5, '2026-09-11T10:05'), round('peek', 2, 5, '2026-09-11T10:10'), round('add', 1, 1, '2026-09-11T10:07'), round('add', 0, 3, '2026-09-11T10:12')];
    expect(levelHistory(rounds, GAMES).map((m) => `${m.game} ${m.from}→${m.to}`)).toEqual(['add 1→0', 'peek 1→2', 'peek 0→1']);
  });

  it('writes coaching notes for quits and slow accuracy', () => {
    const quits = [round('count', 2, 1, '2026-09-10T10:00', { completed: false }), round('count', 2, 0, '2026-09-10T10:05', { completed: false })];
    const slow = [round('peek', 1, 5, '2026-09-11T10:00', { ms: 9000 }), round('peek', 1, 5, '2026-09-11T10:05', { ms: 9000 })];
    const notes = coachingNotes([...quits, ...slow], GAMES, NOW);
    expect(notes.some((n) => n.includes('Left Count With Me early 2 times'))).toBe(true);
    expect(notes.some((n) => n.startsWith('Quick Peek: accurate but slow'))).toBe(true);
    expect(coachingNotes([round('peek', 0, 5, '2026-09-11T10:00')], GAMES, NOW)).toEqual([]);
  });
});
