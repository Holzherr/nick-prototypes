import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Child } from '@/features/children/model';
import { memoryRemote } from '@/features/progress/memory-remote';
import { GUEST_CHILDREN } from '@/features/progress/guest';
import { emptyProgress, type Progress } from '@/features/progress/model';
import { cacheKey, createRepo } from '@/features/progress/repo';
import { MemoryStorage } from '@/shared/utils/storage';
import { GardenApp } from './GardenApp';

/**
 * Guest play living under a different child id, and signing in making it vanish from view, cost most of a
 * day: it looks exactly like lost data, and every wrong turn — a sticky flag, an offer hidden behind the
 * grown-ups sum, an unreachable sign-in form — passed the unit tests underneath it. This mounts the real
 * GardenApp against an in-memory server and walks the path a parent actually takes.
 */
describe('bringing guest play into an account', () => {
  const account: Child = { id: 'child-account', name: 'Tara', birthdate: '2022-05-23', avatar: '🦄' };
  const guestId = 'child-guest';

  const guestProgress = (): Progress => ({
    ...emptyProgress(),
    rounds: [
      { id: 'guest-1', childId: guestId, game: 'count', level: 0, score: 5, total: 5, answers: [], playedAt: new Date().toISOString() },
      { id: 'guest-2', childId: guestId, game: 'count', level: 0, score: 4, total: 5, answers: [], playedAt: new Date().toISOString() },
    ],
    stickers: [{ id: 'guest-st-1', childId: guestId, sticker: 'unicorn/rainbow', shiny: false, roundId: 'guest-1', earnedAt: new Date().toISOString() }],
  });

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(GUEST_CHILDREN, JSON.stringify([{ id: guestId, name: 'Tara', avatar: '🦄' }]));
    localStorage.setItem(cacheKey(guestId), JSON.stringify(guestProgress()));
  });
  afterEach(() => localStorage.clear());

  const mount = (allowGuestImport: boolean) => {
    const remote = memoryRemote();
    const repo = createRepo(remote, new MemoryStorage());
    render(<GardenApp child={account} repo={repo} allowGuestImport={allowGuestImport} onSwitchChild={vi.fn()} onSignOut={vi.fn()} />);
    return repo;
  };

  it('offers the play before the garden, not behind the grown-ups sum', () => {
    mount(true);
    // The whole point: a signed-in parent meets this first, without going looking for it.
    expect(screen.getByText(/play saved on this iPad/i)).toBeInTheDocument();
    expect(screen.queryByText(/Maths Garden$/)).not.toBeInTheDocument();
  });

  it('names what is there, so it is obviously her play and not a stranger', () => {
    mount(true);
    expect(screen.getByText(/2 rounds/i)).toBeInTheDocument();
    expect(screen.getByText(/1 sticker/i)).toBeInTheDocument();
  });

  it('copies the rounds and stickers onto the account child', async () => {
    const repo = mount(true);
    fireEvent.click(screen.getByRole('button', { name: /Add to Tara’s garden|Add to Tara's garden/i }));

    await waitFor(() => {
      const moved = repo.cached(account.id);
      expect(moved.rounds).toHaveLength(2);
      expect(moved.stickers).toHaveLength(1);
      // Records keep their ids, which is what makes a repeat import a no-op.
      expect(moved.rounds.map((r) => r.id).sort()).toEqual(['guest-1', 'guest-2']);
      expect(moved.rounds.every((r) => r.childId === account.id)).toBe(true);
    });
  });

  it('says nothing at all when there is no account to import into', () => {
    mount(false);
    expect(screen.queryByText(/play saved on this iPad/i)).not.toBeInTheDocument();
  });

  it('stops offering once the play is already there', async () => {
    const repo = mount(true);
    fireEvent.click(screen.getByRole('button', { name: /Add to Tara’s garden|Add to Tara's garden/i }));
    await waitFor(() => expect(repo.cached(account.id).rounds).toHaveLength(2));

    // Remounting with the same records: the offer is decided by comparing them, never by a flag, so it
    // has to disappear on its own. A flag here is what hid Tara's play for good.
    render(<GardenApp child={account} repo={repo} allowGuestImport onSwitchChild={vi.fn()} onSignOut={vi.fn()} />);
    // None at all: the first mount has moved past its offer, and the second finds nothing left to import.
    // If the comparison were wrong, this second mount would put one back on screen.
    await waitFor(() => expect(screen.queryAllByText(/play saved on this iPad/i)).toHaveLength(0));
  });
});
