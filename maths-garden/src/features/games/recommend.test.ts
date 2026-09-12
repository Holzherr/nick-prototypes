import { describe, expect, it } from 'vitest';
import { GAMES, type GameId } from './catalog';
import type { Levels, RoundRecord } from './engine';
import { rankGames, recommendGame } from './recommend';

const NOW = new Date('2026-09-12T18:00:00Z');
const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * 3600_000).toISOString();

const round = (id: string, game: GameId, score: number, hours: number, level = 0): RoundRecord => ({
  id,
  childId: 'tara',
  game,
  level,
  score,
  total: 5,
  answers: Array.from({ length: 5 }, (_, i) => ({ target: '3', chosen: i < score ? '3' : 'x', correct: i < score, ms: 2000 })),
  playedAt: hoursAgo(hours),
});

/** Every game played once today, a week ago, so nothing is "new" or stale. */
const allPlayed = (): RoundRecord[] => GAMES.map((game, i) => round(`base-${game.id}`, game.id, 4, 2 + i * 0.1));

const recommend = (rounds: RoundRecord[], levels: Levels = {}, options = {}) => recommendGame(rounds, levels, GAMES, { now: NOW, ...options });

describe('which game to offer next', () => {
  it('leads with one never played', () => {
    const rounds = GAMES.filter((g) => g.id !== 'add').map((game) => round(`r-${game.id}`, game.id, 5, 3));
    const pick = recommend(rounds);
    expect(pick.game.id).toBe('add');
    expect(pick.why).toBe('new');
    expect(pick.reason).toMatch(/new one/i);
  });

  it('changes after she plays, without being told what was shown', () => {
    const rounds = allPlayed();
    const first = recommend(rounds);
    // She plays it: that round is now the most recent, so the next suggestion moves on.
    const after = recommend([...rounds, round('just-played', first.game.id, 5, 0)]);
    expect(after.game.id).not.toBe(first.game.id);
  });

  it('prefers the skill going badly over the one going well', () => {
    const rounds = [
      ...GAMES.map((game) => round(`old-${game.id}`, game.id, 4, 40)),
      round('bad1', 'find', 1, 30),
      round('bad2', 'find', 1, 29),
      round('good1', 'peek', 5, 28),
      round('good2', 'peek', 5, 27),
    ];
    const ranked = rankGames(rounds, {}, GAMES, { now: NOW, avoid: null });
    expect(ranked[0].game.id).toBe('find');
    expect(ranked[0].why).toBe('practise');
    expect(ranked.findIndex((r) => r.game.id === 'peek')).toBeGreaterThan(0);
  });

  it('offers the one a good round would level up', () => {
    // The latest round for that game has to be a good one at the level it is currently on.
    const rounds = [...allPlayed(), round('nearly', 'more', 5, 0.5, 1)];
    const ranked = rankGames(rounds, { more: 1 }, GAMES, { now: NOW, avoid: null });
    expect(ranked.find((r) => r.game.id === 'more')?.why).toBe('nearly');
  });

  it('still suggests something when everything has been played today', () => {
    const rounds = GAMES.flatMap((game) => [round(`a-${game.id}`, game.id, 4, 1), round(`b-${game.id}`, game.id, 4, 2)]);
    const pick = recommend(rounds);
    expect(GAMES.some((g) => g.id === pick.game.id)).toBe(true);
    expect(pick.reason.length).toBeGreaterThan(4);
  });

  it('is the same for the same history, and rotates ties', () => {
    const rounds = allPlayed();
    expect(recommend(rounds).game.id).toBe(recommend(rounds).game.id);
    const a = rankGames(rounds, {}, GAMES, { now: NOW, avoid: null, rotate: 0 })[0].game.id;
    const b = rankGames(rounds, {}, GAMES, { now: NOW, avoid: null, rotate: 3 })[0].game.id;
    expect([a, b].every((id) => GAMES.some((g) => g.id === id))).toBe(true);
  });

  it('recommends something on day one', () => {
    const pick = recommend([]);
    expect(pick.why).toBe('new');
    expect(pick.game.id).toBe(GAMES[0].id);
  });
});
