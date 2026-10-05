// @vitest-environment-options { "url": "https://maths.example/" }
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Child } from '@/features/children/model';
import { GAMES, isGameId } from '@/features/games/catalog';
import type { RoundRecord } from '@/features/games/engine';
import { rankGames } from '@/features/games/recommend';
import { memoryRemote } from '@/features/progress/memory-remote';
import { emptyProgress, type Progress } from '@/features/progress/model';
import { cacheKey, createRepo } from '@/features/progress/repo';
import { supabaseRemote } from '@/features/progress/supabase-remote';
import { MemoryStorage } from '@/shared/utils/storage';
import { GardenApp } from './GardenApp';

/**
 * Patterns and Number Track (specs/question-bank.md) are games of their own: a tile on home, offered by the
 * suggestion like any game, and a finished round is a `maths_rounds` row under the new id with `levelMax` the
 * bank level it drew from. This mounts the real GardenApp, plays a Patterns round and pushes the row it wrote.
 */
const upsert = vi.fn((_row: Record<string, unknown>) => Promise.resolve({ error: null }));
vi.mock('@/shared/supabase/client', () => ({ cloudConfigured: true, supabase: { from: () => ({ insert: () => Promise.resolve({ error: null }), upsert }) } }));

describe('the question-bank games', () => {
  const child: Child = { id: 'child-1', name: 'Tara', birthdate: '2022-05-23', avatar: '🦄' };

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('are game ids, and the suggestion offers them once every other game has been played', () => {
    expect(isGameId('pattern')).toBe(true);
    expect(isGameId('sequence')).toBe(true);
    const yesterday = new Date(Date.now() - 24 * 3600_000).toISOString();
    const played: RoundRecord[] = GAMES.filter((g) => g.id !== 'pattern' && g.id !== 'sequence').map((game) => ({ id: `r-${game.id}`, childId: child.id, game: game.id, level: 0, score: 5, total: 5, answers: [], playedAt: yesterday }));
    expect(rankGames(played, {}, GAMES).slice(0, 2).map((s) => s.game.id).sort()).toEqual(['pattern', 'sequence']);
  });

  it('shows both tiles on home, and a finished Patterns round records the new id with levelMax = level', async () => {
    const progress: Progress = { ...emptyProgress(), levels: { pattern: 1 } };
    const storage = new MemoryStorage();
    storage.setItem(cacheKey(child.id), JSON.stringify(progress));
    const repo = createRepo(memoryRemote({ [child.id]: progress }), storage);
    const applied = vi.spyOn(repo, 'apply');
    render(<GardenApp child={child} repo={repo} onSwitchChild={vi.fn()} onSignOut={vi.fn()} />);

    const pickAnother = screen.queryByRole('button', { name: /Or pick another game/ });
    if (pickAnother) fireEvent.click(pickAnother);
    expect(screen.getByRole('button', { name: /Number Track/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Patterns/ }));

    for (let i = 0; i < 5; i++) {
      const answers = screen.getAllByRole('button').filter((button) => button.closest('main') && !button.hasAttribute('aria-label'));
      fireEvent.click(answers[0]);
      act(() => vi.advanceTimersByTime(2400));
    }

    const rounds = applied.mock.calls.flatMap(([change]) => (change.kind === 'round' ? [change.round] : []));
    expect(rounds.map((r) => [r.game, r.level, r.levelMax, r.total])).toEqual([['pattern', 1, 2, 5]]);
    // Each answer is logged by item id; after two misses the next item is eased from the level below.
    expect(rounds[0].answers.every((a) => /^pattern-[12]-\d+$/.test(a.target))).toBe(true);
    expect(rounds[0].answers[0].target).toMatch(/^pattern-2-/);

    await supabaseRemote.push({ kind: 'round', round: rounds[0] });
    expect(upsert.mock.calls[0][0]).toMatchObject({ game: 'pattern', level: 1, level_max: 2, total: 5 });
  });
});
