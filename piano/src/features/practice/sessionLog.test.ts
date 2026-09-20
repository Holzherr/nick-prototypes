import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { logPress, readSessions, sessionsIn, writeSession, type SessionRecord } from './sessionLog.ts';

const at = (iso: string): SessionRecord =>
  ({ id: iso, pieceId: 'this-old-man', startedAt: iso, lastPressAt: iso, correctPresses: 1, reachedLast: false });
const now = new Date('2026-09-20T20:00:00Z');

beforeEach(() => localStorage.clear());

describe('sessionsIn', () => {
  it('counts only sessions whose last press is within the window', () => {
    const log = [at('2026-09-20T19:00:00Z'), at('2026-09-14T00:00:00Z'), at('2026-09-13T19:59:59Z'), at('2026-09-01T00:00:00Z')];
    expect(sessionsIn(7, now, log)).toBe(2);
  });
});

describe('the store', () => {
  it('keeps the 100 most recent entries', () => {
    for (let h = 0; h < 101; h++) writeSession(at(new Date(Date.UTC(2026, 0, 1, h)).toISOString()));
    expect(readSessions()).toHaveLength(100);
    expect(readSessions()[0].id).toBe('2026-01-01T01:00:00.000Z');
  });
  it('starts a record on the first press, then rewrites that same record', () => {
    const first = logPress(null, 'this-old-man', false, new Date('2026-09-20T10:00:00Z'));
    logPress(first, 'this-old-man', true, new Date('2026-09-20T10:00:05Z'));
    expect(first).toMatchObject({ pieceId: 'this-old-man', startedAt: '2026-09-20T10:00:00.000Z', correctPresses: 1 });
    expect(readSessions()).toEqual([{ ...first, lastPressAt: '2026-09-20T10:00:05.000Z', correctPresses: 2, reachedLast: true }]);
  });
});

describe('?sessions', () => {
  it('renders the log and the 7-day count instead of the practice screen', async () => {
    writeSession(at(new Date().toISOString()));
    history.replaceState(null, '', '?sessions');
    document.body.innerHTML = '<div id="root"></div>';
    await act(async () => { await import('@/main.tsx'); });
    expect(document.body.textContent).toContain('"sessions_7d": 1');
    expect(document.querySelector('.kb')).toBeNull();
  });
});
