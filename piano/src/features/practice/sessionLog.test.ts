import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SESSIONS_KEY, logPress, readSessions, sessionsIn, writeSession, type SessionRecord } from './sessionLog.ts';

const at = (iso: string, reachedLast = false): SessionRecord =>
  ({ id: iso, pieceId: 'this-old-man', startedAt: iso, lastPressAt: iso, correctPresses: 1, reachedLast });
const now = new Date('2026-09-20T20:00:00Z');

beforeEach(() => localStorage.clear());

describe('sessionsIn', () => {
  it('counts only sessions whose last press is within the window', () => {
    const log = [at('2026-09-20T19:00:00Z', true), at('2026-09-14T00:00:00Z', true), at('2026-09-13T19:59:59Z', true), at('2026-09-01T00:00:00Z', true)];
    expect(sessionsIn(7, now, log)).toBe(2);
  });
  it('counts only runs that reached the last note, not every stored record', () => {
    const log = [at('2026-09-20T19:00:00Z', true), at('2026-09-20T18:00:00Z'), at('2026-09-19T19:00:00Z', true), at('2026-09-18T19:00:00Z')];
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
    const first = logPress(null, 'this-old-man', 2, new Date('2026-09-20T10:00:00Z'));
    logPress(first, 'this-old-man', 2, new Date('2026-09-20T10:00:05Z'));
    expect(first).toMatchObject({ pieceId: 'this-old-man', startedAt: '2026-09-20T10:00:00.000Z', correctPresses: 1, reachedLast: false });
    expect(readSessions()).toEqual([{ ...first, lastPressAt: '2026-09-20T10:00:05.000Z', correctPresses: 2, reachedLast: true }]);
  });
  it('only marks reachedLast once every note of the piece has been pressed', () => {
    const first = logPress(null, 'this-old-man', 3, new Date('2026-09-20T10:00:00Z'));
    const second = logPress(first, 'this-old-man', 3, new Date('2026-09-20T10:00:01Z'));
    expect(second.reachedLast).toBe(false);
    expect(logPress(second, 'this-old-man', 3, new Date('2026-09-20T10:00:02Z')).reachedLast).toBe(true);
  });
});

describe('?sessions', () => {
  it.each([[false, 0], [true, 1]])('renders the log and the 7-day count instead of the practice screen (reachedLast %s counts %i)', async (reachedLast, count) => {
    vi.resetModules();
    writeSession(at(new Date().toISOString(), reachedLast));
    history.replaceState(null, '', '?sessions');
    document.body.innerHTML = '<div id="root"></div>';
    await act(async () => { await import('@/main.tsx'); });
    expect(document.body.textContent).toContain(`"sessions_7d": ${count}`);
    expect(document.querySelector('.kb')).toBeNull();
  });
  it('shows markup stored in the log as text, never as HTML', async () => {
    vi.resetModules();
    writeSession({ ...at(new Date().toISOString()), pieceId: '<img src=x onerror=alert(1)>' });
    history.replaceState(null, '', '?sessions');
    document.body.innerHTML = '<div id="root"></div>';
    await act(async () => { await import('@/main.tsx'); });
    expect(document.querySelector('img')).toBeNull();
    expect(document.body.textContent).toContain('<img src=x onerror=alert(1)>');
  });
});

describe('a log another page on the origin wrote', () => {
  it('skips entries that are not session records, so a press still logs', () => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify([null, 'x', { id: 7 }, at('2026-09-20T09:00:00.000Z', true)]));
    expect(readSessions()).toEqual([at('2026-09-20T09:00:00.000Z', true)]);
    expect(() => logPress(null, 'this-old-man', 2, now)).not.toThrow();
    expect(sessionsIn(7, now)).toBe(1);
  });
});
