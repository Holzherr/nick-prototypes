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
 * Home leads with one suggested game, and the Analyst asks whether children take it. Every start used to
 * count the same, so the answer was "no data". The spy keeps the real `track` underneath, so the guest
 * promise — nothing recorded at all — is asserted against the real early return, not a stub. The document
 * URL is not localhost, where `track` is off by design.
 */
const insert = vi.fn((_row: { name: string }) => Promise.resolve({ error: null }));
vi.mock('@/shared/supabase/client', () => ({ cloudConfigured: true, supabase: { from: () => ({ insert }) } }));
vi.mock('@/features/analytics/events', async (importActual) => {
  const actual = await importActual<typeof import('@/features/analytics/events')>();
  return { ...actual, track: vi.fn(actual.track) };
});
const { track } = await import('@/features/analytics/events');

describe('what home records about the suggested game', () => {
  const child: Child = { id: 'child-1', name: 'Tara', birthdate: '2022-05-23', avatar: '🦄' };
  const suggested = recommendGame([], {}, GAMES).game;
  const other = GAMES.find((game) => game.id !== suggested.id && game.id === 'count') ?? GAMES[1];

  const names = () => vi.mocked(track).mock.calls.map(([name]) => name);
  const mount = () => render(<GardenApp child={child} repo={createRepo(memoryRemote(), new MemoryStorage())} onSwitchChild={vi.fn()} onSignOut={vi.fn()} />);
  const tapSuggested = () => fireEvent.click(screen.getByRole('button', { name: new RegExp(`^Play ${gameName(suggested.id)}\\.`) }));
  const tapOther = () => {
    fireEvent.click(screen.getByRole('button', { name: /Or pick another game/ }));
    fireEvent.click(screen.getByRole('button', { name: new RegExp(gameName(other.id)) }));
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

  it('tapping the suggested game is a start and one offer_taken', () => {
    mount();
    tapSuggested();
    expect(names()).toEqual(['game_start', 'offer_taken']);
  });

  it('picking a different game behind "Or pick another game" is a start and one offer_skipped', () => {
    mount();
    tapOther();
    expect(names()).toEqual(['game_start', 'offer_skipped']);
  });

  it('"Play again" on the end screen is a start and no offer event: nothing was offered', () => {
    vi.useFakeTimers();
    mount();
    tapOther();
    // A round is five taps; whichever answer she picks, the next question follows a short pause.
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getAllByRole('button').filter((button) => /^\d+$/.test(button.textContent ?? ''))[0]);
      act(() => vi.advanceTimersByTime(2400));
    }
    fireEvent.click(screen.getByRole('button', { name: /Unicorns/ }));
    vi.mocked(track).mockClear();

    fireEvent.click(screen.getByRole('button', { name: /Play again/ }));
    expect(names()).toEqual(['game_start']);
  });

  it('records nothing at all in guest mode, offer or not', () => {
    localStorage.setItem(GUEST_FLAG, 'true');
    mount();
    tapSuggested();
    expect(names()).toEqual(['game_start', 'offer_taken']);
    expect(insert).not.toHaveBeenCalled();
  });

  it('sends each event once a signed-in child is playing', () => {
    mount();
    tapSuggested();
    expect(insert.mock.calls.map(([row]) => row.name)).toEqual(['game_start', 'offer_taken']);
  });
});
