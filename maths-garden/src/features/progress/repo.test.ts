import { describe, expect, it } from 'vitest';
import type { RoundRecord } from '@/features/games/engine';
import { MemoryStorage } from '@/shared/utils/storage';
import { applyChange, emptyProgress, PermanentError, type Change, type Remote } from './model';
import { createRepo } from './repo';

const fakeServer = () => {
  const state = { online: true, reject: false, server: emptyProgress(), pushes: 0 };
  const remote: Remote = {
    async fetch() {
      if (!state.online) throw new Error('offline');
      return structuredClone(state.server);
    },
    async push(change) {
      if (!state.online) throw new Error('offline');
      if (state.reject) throw new PermanentError('check constraint');
      state.pushes++;
      state.server = applyChange(state.server, change);
    },
  };
  return { state, remote };
};

const round = (id: string, childId = 'tara'): RoundRecord => ({
  id,
  childId,
  game: 'peek',
  level: 0,
  score: 4,
  total: 5,
  answers: [],
  playedAt: '2026-09-11T09:00:00Z',
});

const roundChange = (id: string, childId?: string): Change => ({ kind: 'round', round: round(id, childId) });

describe('progress repo', () => {
  it('saves locally and uploads when online', async () => {
    const { state, remote } = fakeServer();
    const repo = createRepo(remote, new MemoryStorage());
    await repo.apply(roundChange('a'));
    expect(repo.cached('tara').rounds.map((r) => r.id)).toEqual(['a']);
    expect(state.server.rounds.map((r) => r.id)).toEqual(['a']);
    expect(repo.pending()).toBe(0);
  });

  it('keeps offline changes and uploads them on the next load', async () => {
    const { state, remote } = fakeServer();
    const repo = createRepo(remote, new MemoryStorage());
    state.online = false;
    await repo.apply(roundChange('a'));
    await repo.apply({ kind: 'level', childId: 'tara', game: 'peek', level: 1 });
    expect(repo.pending()).toBe(2);
    expect((await repo.load('tara')).levels).toEqual({ peek: 1 });

    state.online = true;
    const loaded = await repo.load('tara');
    expect(repo.pending()).toBe(0);
    expect(state.server.rounds.map((r) => r.id)).toEqual(['a']);
    expect(loaded).toEqual(state.server);
  });

  it('shows queued changes on top of server data', async () => {
    const { state, remote } = fakeServer();
    const repo = createRepo(remote, new MemoryStorage());
    state.server = applyChange(state.server, roundChange('old'));
    remote.push = async () => {
      throw new Error('timeout');
    };
    await repo.apply(roundChange('new'));
    expect((await repo.load('tara')).rounds.map((r) => r.id)).toEqual(['old', 'new']);
  });

  it('drops a change the server rejects instead of blocking the queue', async () => {
    const { state, remote } = fakeServer();
    const repo = createRepo(remote, new MemoryStorage());
    state.reject = true;
    await repo.apply(roundChange('bad'));
    expect(repo.pending()).toBe(0);
    state.reject = false;
    await repo.apply(roundChange('good'));
    expect(state.server.rounds.map((r) => r.id)).toEqual(['good']);
  });

  it('keeps children apart', async () => {
    const { remote } = fakeServer();
    const repo = createRepo(remote, new MemoryStorage());
    await repo.apply(roundChange('a', 'tara'));
    await repo.apply(roundChange('b', 'sibling'));
    expect(repo.cached('tara').rounds.map((r) => r.id)).toEqual(['a']);
    expect(repo.cached('sibling').rounds.map((r) => r.id)).toEqual(['b']);
  });
});
