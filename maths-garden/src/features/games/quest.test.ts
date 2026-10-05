import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@/shared/utils/random';
import { GAMES, gameById, type GameId } from './catalog';
import { mastered, nextLevel, skillStats, type AnswerRecord, type RoundRecord } from './engine';
import { makeQuest, questFinishedToday, questRounds, weakestGames } from './quest';
import { recommendGame } from './recommend';

const NOW = new Date('2026-09-28T18:00:00Z');
const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * 3600_000).toISOString();

/** A finished round with `score` of five right, `hours` ago. */
const round = (id: string, game: GameId, score: number, hours = 20, level = 0): RoundRecord => ({
  id,
  childId: 'child-1',
  game,
  level,
  score,
  total: 5,
  answers: Array.from({ length: 5 }, (_, i) => ({ target: '3', chosen: i < score ? '3' : 'x', correct: i < score, ms: 2000 })),
  playedAt: hoursAgo(hours),
});

/** Per-skill accuracy fixtures: Make Ten weakest, then Which Has More, then One Fewer, the rest strong. */
const uneven = (): RoundRecord[] => [
  ...GAMES.map((game, i) => round(`strong-${game.id}`, game.id, 5, 30 + i)),
  round('bond-1', 'bond', 1, 25, 2),
  round('bond-2', 'bond', 2, 24, 2),
  round('more-1', 'more', 2, 23, 1),
  round('more-2', 'more', 3, 22, 1),
  round('fewer-1', 'fewer', 3, 21, 3),
  round('fewer-2', 'fewer', 4, 20, 3),
];

describe('drawing a quest', () => {
  it('puts the three weakest skills first, weakest of all at the front', () => {
    expect(weakestGames(uneven(), GAMES).slice(0, 3).map((g) => g.id)).toEqual(['bond', 'more', 'fewer']);
  });

  it('draws five questions from the three weakest games at their current levels', () => {
    const levels = { bond: 2, more: 1, fewer: 3 };
    const quest = makeQuest(uneven(), levels, GAMES, mulberry32(7));
    expect(quest?.games.map((g) => g.id)).toEqual(['bond', 'more', 'fewer']);
    expect(quest?.levels).toEqual(levels);
    // Two each from the two weakest, one from the third, weakest first.
    expect(quest?.questions.map((q) => q.game)).toEqual(['bond', 'more', 'fewer', 'bond', 'more']);
    // Make Ten at level 2 makes ten with no frame; One Fewer at level 3 starts from five or more.
    for (const q of quest?.questions ?? []) {
      if (q.game === 'bond') expect([q.whole, q.frame]).toEqual([10, false]);
      if (q.game === 'fewer') expect(q.base).toBeGreaterThanOrEqual(5);
    }
  });

  it('is the same quest for the same history and seed', () => {
    expect(makeQuest(uneven(), {}, GAMES, mulberry32(3))?.questions).toEqual(makeQuest(uneven(), {}, GAMES, mulberry32(3))?.questions);
  });

  it('breaks a tie by catalogue order, the order the skills are learnt', () => {
    const rounds = GAMES.slice(0, 4).map((game) => round(`r-${game.id}`, game.id, 4));
    expect(makeQuest(rounds, {}, GAMES, mulberry32(1))?.games.map((g) => g.id)).toEqual(['peek', 'count', 'find']);
  });

  it('gives a child with fewer than three games played no quest', () => {
    expect(makeQuest([], {}, GAMES)).toBeNull();
    expect(makeQuest([round('a', 'peek', 2), round('b', 'count', 2)], {}, GAMES)).toBeNull();
    // A round left early does not count as a game played.
    expect(makeQuest([round('a', 'peek', 2), round('b', 'count', 2), { ...round('c', 'find', 2), completed: false }], {}, GAMES)).toBeNull();
    expect(makeQuest([round('a', 'peek', 2), round('b', 'count', 2), round('c', 'find', 2)], {}, GAMES, mulberry32(1))).not.toBeNull();
  });
});

describe('what a finished quest records', () => {
  const quest = makeQuest(uneven(), { bond: 2, more: 1, fewer: 3 }, GAMES, mulberry32(7));
  if (!quest) throw new Error('no quest');
  const answer = (correct: boolean): AnswerRecord => ({ target: 't', chosen: correct ? 't' : 'x', correct, ms: 1500, totalMs: 2000 });
  let n = 0;
  const ids = () => `id-${++n}`;

  it('writes one round row per source game, each at its own level, sharing one playedAt', () => {
    const rows = questRounds(quest, [true, false, true, true, true].map(answer), 'child-1', true, NOW, ids);
    // agent_snapshot groups by game: three rows in three games, none under a game that did not ask.
    expect(rows.map((r) => [r.game, r.level, r.score, r.total])).toEqual([
      ['bond', 2, 2, 2],
      ['more', 1, 1, 2],
      ['fewer', 3, 1, 1],
    ]);
    expect(rows.map((r) => r.levelMax)).toEqual([gameById('bond').levels[2].max, gameById('more').levels[1].max, gameById('fewer').levels[3].max]);
    expect(new Set(rows.map((r) => r.playedAt)).size).toBe(1);
    expect(new Set(rows.map((r) => r.id)).size).toBe(3);
    expect(rows.every((r) => r.childId === 'child-1' && r.completed === undefined)).toBe(true);
  });

  it('records a quest given up part-way as rounds left early, only for the games that were asked', () => {
    const rows = questRounds(quest, [answer(true), answer(false)], 'child-1', false, NOW, ids);
    expect(rows.map((r) => [r.game, r.total, r.completed])).toEqual([
      ['bond', 1, false],
      ['more', 1, false],
    ]);
  });

  it('is what tells home a quest was finished today', () => {
    const rows = questRounds(quest, [true, true, true, true, true].map(answer), 'child-1', true, NOW, ids);
    expect(questFinishedToday(uneven(), NOW)).toBe(false);
    expect(questFinishedToday([...uneven(), ...rows], NOW)).toBe(true);
    // Yesterday's quest does not count, and a round left early is no finished quest.
    expect(questFinishedToday([...uneven(), ...rows], new Date(NOW.getTime() + 24 * 3600_000))).toBe(false);
    expect(questFinishedToday(questRounds(quest, [answer(true), answer(true)], 'child-1', false, NOW, ids), NOW)).toBe(false);
  });
});

describe('what a quest row does to levels', () => {
  const peek = gameById('peek');
  const top = peek.levels.length - 1;
  /** A quest's row for one game: one or two quick answers. */
  const short = (id: string, score: number, total: number, hours: number, level = 0): RoundRecord => ({
    ...round(id, 'peek', score, hours, level),
    total,
    answers: Array.from({ length: total }, (_, i) => ({ target: '3', chosen: i < score ? '3' : 'x', correct: i < score, ms: 1000 })),
  });

  it('one right answer at the top level is not a mastery; a full perfect round is', () => {
    expect(mastered([short('q1', 1, 1, 2, top), short('q2', 2, 2, 1, top)], peek)).toBe(false);
    expect(mastered([round('full', 'peek', 5, 2, top)], peek)).toBe(true);
  });

  it('never fills the three-round window', () => {
    // Three perfect quest rows are six answers, not three rounds: no level up.
    expect(nextLevel([short('q1', 2, 2, 3), short('q2', 2, 2, 2), short('q3', 1, 1, 1)], peek, 0)).toBe(0);
    // Missed quest answers between three good full rounds do not pull their average under 90%.
    const good = [round('a', 'peek', 5, 5), short('q1', 0, 2, 4), round('b', 'peek', 5, 3), short('q2', 0, 2, 2), round('c', 'peek', 4, 1)];
    expect(nextLevel(good, peek, 0)).toBe(1);
    // Nor do two missed quest rows and one poor full round drop a level.
    expect(nextLevel([round('a', 'peek', 2, 3, 1), short('q1', 0, 1, 2, 1), short('q2', 0, 2, 1, 1)], peek, 1)).toBe(1);
  });

  it('still counts in the accuracy the next quest reads', () => {
    expect(skillStats([round('a', 'peek', 5, 3), short('q', 0, 1, 2)], 'peek')).toEqual({ pct: 83, rounds: 2 });
  });
});

describe('where home offers the quest', () => {
  it('leads with the quest once three games are played and none is still new', () => {
    const pick = recommendGame(uneven(), {}, GAMES, { now: NOW });
    expect(pick.why).toBe('quest');
    expect(pick.quest?.games.map((g) => g.id)).toEqual(['bond', 'more', 'fewer']);
    expect(pick.reason).toMatch(/three games/i);
  });

  it('still leads with a never-played game, and with none once she passed the quest over', () => {
    expect(recommendGame(uneven().filter((r) => r.game !== 'shape'), {}, GAMES, { now: NOW }).why).toBe('new');
    expect(recommendGame(uneven(), {}, GAMES, { now: NOW, quest: false }).quest).toBeUndefined();
  });

  it('offers a game again once the day’s quest is done, and the quest again tomorrow', () => {
    const quest = makeQuest(uneven(), {}, GAMES, mulberry32(2));
    if (!quest) throw new Error('no quest');
    const answers = Array.from({ length: 5 }, () => ({ target: 't', chosen: 't', correct: true, ms: 1000 }));
    const done = [...uneven(), ...questRounds(quest, answers, 'child-1', true, NOW)];
    expect(recommendGame(done, {}, GAMES, { now: NOW }).quest).toBeUndefined();
    expect(recommendGame(done, {}, GAMES, { now: new Date(NOW.getTime() + 24 * 3600_000) }).why).toBe('quest');
  });

  it('offers no quest with fewer than three games played', () => {
    expect(recommendGame([round('a', 'peek', 2), round('b', 'count', 2)], {}, GAMES, { now: NOW }).quest).toBeUndefined();
  });
});
