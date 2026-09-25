// @vitest-environment-options { "url": "https://maths.example/" }
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Child } from '@/features/children/model';
import { GAMES } from '@/features/games/catalog';
import { recommendGame } from '@/features/games/recommend';
import { gameName } from '@/features/i18n/content';
import { GUEST_FLAG } from '@/features/progress/guest';
import { memoryRemote } from '@/features/progress/memory-remote';
import { createRepo } from '@/features/progress/repo';
import { MemoryStorage } from '@/shared/utils/storage';
import { GardenApp } from './GardenApp';

/**
 * A game started and given up before its first answer used to leave nothing behind: no round, no quit, so
 * the Analyst could not tell it from a start that failed. `game_left` marks that moment. As in
 * offer-events.test.tsx, the spy keeps the real `track` underneath so the guest promise is asserted
 * against the real early return, and the document URL is not localhost, where `track` is off by design.
 */
const insert = vi.fn((_row: { name: string }) => Promise.resolve({ error: null }));
vi.mock('@/shared/supabase/client', () => ({ cloudConfigured: true, supabase: { from: () => ({ insert }) } }));
vi.mock('@/features/analytics/events', async (importActual) => {
  const actual = await importActual<typeof import('@/features/analytics/events')>();
  return { ...actual, track: vi.fn(actual.track) };
});
const { track } = await import('@/features/analytics/events');

describe('what leaving a game before its first answer records', () => {
  const child: Child = { id: 'child-1', name: 'Tara', birthdate: '2022-05-23', avatar: '🦄' };
  const suggested = recommendGame([], {}, GAMES).game;
  const other = GAMES.find((game) => game.id !== suggested.id && game.id === 'count') ?? GAMES[1];

  const names = () => vi.mocked(track).mock.calls.map(([name]) => name);
  const mount = () => {
    const repo = createRepo(memoryRemote(), new MemoryStorage());
    const applied = vi.spyOn(repo, 'apply');
    render(<GardenApp child={child} repo={repo} onSwitchChild={vi.fn()} onSignOut={vi.fn()} />);
    return () => applied.mock.calls.map(([change]) => change).filter((change) => change.kind === 'round');
  };
  const tapSuggested = () => fireEvent.click(screen.getByRole('button', { name: new RegExp(`^Play ${gameName(suggested.id)}\\.`) }));
  const tapHome = () => fireEvent.click(screen.getByRole('button', { name: 'Home' }));
  const tapOther = () => {
    fireEvent.click(screen.getByRole('button', { name: /Or pick another game/ }));
    fireEvent.click(screen.getByRole('button', { name: new RegExp(gameName(other.id)) }));
  };
  const answerOne = () => {
    fireEvent.click(screen.getAllByRole('button').filter((button) => /^\d+$/.test(button.textContent ?? ''))[0]);
    act(() => vi.advanceTimersByTime(2400));
  };

  beforeEach(() => {
    localStorage.clear();
    vi.mocked(track).mockClear();
    insert.mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('Home before any answer, then a different game: one game_left between the two starts, and no round', () => {
    const rounds = mount();
    tapSuggested();
    tapHome();
    tapOther();
    expect(names()).toEqual(['game_start', 'offer_taken', 'game_left', 'game_start', 'offer_skipped']);
    expect(rounds()).toEqual([]);
  });

  it('Home after one answer, then a different game: no game_left, one round left unfinished', () => {
    vi.useFakeTimers();
    const rounds = mount();
    // Counting answers with a digit, so one tap is one answer whatever the question; the suggested game comes second.
    tapOther();
    answerOne();
    tapHome();
    tapSuggested();
    expect(names()).toEqual(['game_start', 'offer_skipped', 'game_start', 'offer_taken']);
    expect(rounds()).toHaveLength(1);
    expect(rounds()[0]).toMatchObject({ kind: 'round', round: { game: other.id, total: 1, completed: false } });
  });

  it('Home, then "Carry on": no game_left, carrying on is not leaving', () => {
    const rounds = mount();
    tapSuggested();
    tapHome();
    fireEvent.click(screen.getByRole('button', { name: /Carry on/ }));
    expect(names()).toEqual(['game_start', 'offer_taken']);
    expect(rounds()).toEqual([]);
  });

  it('records nothing at all in guest mode', () => {
    localStorage.setItem(GUEST_FLAG, 'true');
    mount();
    tapSuggested();
    tapHome();
    tapOther();
    expect(names()).toContain('game_left');
    expect(insert).not.toHaveBeenCalled();
  });
});
