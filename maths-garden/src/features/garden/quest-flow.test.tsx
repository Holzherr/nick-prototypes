// @vitest-environment-options { "url": "https://maths.example/" }
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Child } from '@/features/children/model';
import { GAMES, type GameId } from '@/features/games/catalog';
import type { RoundRecord } from '@/features/games/engine';
import { memoryRemote } from '@/features/progress/memory-remote';
import { emptyProgress, type Progress } from '@/features/progress/model';
import { cacheKey, createRepo } from '@/features/progress/repo';
import { MemoryStorage } from '@/shared/utils/storage';
import { GardenApp } from './GardenApp';

/**
 * The quest round (specs/rounds.md) is a shape of round, not a game: five questions from the three weakest
 * skills, and a finished one writes one round row per source game so `agent_snapshot` counts it by game.
 * This mounts the real GardenApp on a child whose three weakest games all answer with digit buttons, so
 * one tap is one answer, and walks the quest from the home tile to the sticker chooser.
 */
vi.mock('@/shared/supabase/client', () => ({ cloudConfigured: true, supabase: { from: () => ({ insert: () => Promise.resolve({ error: null }) }) } }));
vi.mock('@/features/analytics/events', async (importActual) => {
  const actual = await importActual<typeof import('@/features/analytics/events')>();
  return { ...actual, track: vi.fn(actual.track) };
});
const { track } = await import('@/features/analytics/events');

describe('playing the quest round', () => {
  const child: Child = { id: 'child-1', name: 'Tara', birthdate: '2022-05-23', avatar: '🦄' };
  const yesterday = new Date(Date.now() - 24 * 3600_000).toISOString();
  const round = (game: GameId, score: number, level: number): RoundRecord => ({
    id: `seed-${game}`,
    childId: child.id,
    game,
    level,
    score,
    total: 5,
    answers: Array.from({ length: 5 }, (_, i) => ({ target: '3', chosen: i < score ? '3' : 'x', correct: i < score, ms: 2000 })),
    playedAt: yesterday,
  });
  /** Every game played yesterday; Count With Me, Find the Number and Make Ten going badly, at levels 1, 0 and 2. */
  const seeded = (): Progress => ({
    ...emptyProgress(),
    rounds: GAMES.map((game) => round(game.id, game.id === 'count' || game.id === 'find' || game.id === 'bond' ? 1 : 5, game.id === 'count' ? 1 : game.id === 'bond' ? 2 : 0)),
    levels: { count: 1, bond: 2 },
  });

  const mount = () => {
    const storage = new MemoryStorage();
    storage.setItem(cacheKey(child.id), JSON.stringify(seeded()));
    const repo = createRepo(memoryRemote({ [child.id]: seeded() }), storage);
    const applied = vi.spyOn(repo, 'apply');
    render(<GardenApp child={child} repo={repo} onSwitchChild={vi.fn()} onSignOut={vi.fn()} />);
    return () => applied.mock.calls.map(([change]) => change).filter((change) => change.kind === 'round');
  };
  const names = () => vi.mocked(track).mock.calls.map(([name]) => name);
  const answerOne = () => {
    fireEvent.click(screen.getAllByRole('button').filter((button) => /^\d+$/.test(button.textContent ?? ''))[0]);
    act(() => vi.advanceTimersByTime(2400));
  };

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    vi.mocked(track).mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('leads with the quest once three games are played, and finishing it writes one row per source game', () => {
    const rounds = mount();
    fireEvent.click(screen.getByRole('button', { name: /^Play Quest\./ }));
    expect(names()).toEqual(['game_start', 'offer_taken']);

    for (let i = 0; i < 5; i++) answerOne();

    // The end screen, with the sticker packs to choose from: the quest is over.
    expect(screen.getByRole('button', { name: /Unicorns/ })).toBeInTheDocument();
    expect(names()).toEqual(['game_start', 'offer_taken', 'round_done']);

    const written = rounds().map((change) => (change.kind === 'round' ? change.round : null)).filter((r) => r !== null);
    expect(written.map((r) => r.game)).toEqual(['count', 'find', 'bond']);
    // Two each from the two weakest, one from the third; each at its own game's level, all at one instant.
    expect(written.map((r) => [r.level, r.total])).toEqual([
      [1, 2],
      [0, 2],
      [2, 1],
    ]);
    expect(new Set(written.map((r) => r.playedAt)).size).toBe(1);
    expect(written.every((r) => r.completed === undefined && r.childId === child.id)).toBe(true);
    expect(written.reduce((sum, r) => sum + r.total, 0)).toBe(5);
  });

  it('a game picked instead of the quest is an offer_skipped, and leaving the quest pauses it', () => {
    const rounds = mount();
    fireEvent.click(screen.getByRole('button', { name: /^Play Quest\./ }));
    answerOne();
    fireEvent.click(screen.getByRole('button', { name: 'Home' }));
    expect(screen.getByText(/You were playing Quest/)).toBeInTheDocument();
    expect(rounds()).toEqual([]);

    // Starting a game instead gives the quest up: what was answered lands under the game that asked it.
    fireEvent.click(screen.getByRole('button', { name: /Or pick another game/ }));
    fireEvent.click(screen.getByRole('button', { name: /Which Has More/ }));
    expect(names()).toEqual(['game_start', 'offer_taken', 'game_start', 'offer_skipped']);
    expect(rounds().map((change) => (change.kind === 'round' ? [change.round.game, change.round.total, change.round.completed] : null))).toEqual([['count', 1, false]]);
  });
});
