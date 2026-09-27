import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { thisOldMan } from '@/features/score/pieces/this-old-man.ts';
import { readSessions } from './sessionLog.ts';
import { usePractice } from './usePractice.ts';

const notes = thisOldMan.notes;
const wrong = 61; // a black key; the piece has no sharps or flats

beforeEach(() => { localStorage.clear(); vi.useFakeTimers({ now: new Date('2026-09-20T10:00:00Z') }); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

/** A build with a Supabase key, and a fetch that settles at once. */
function withBackend(fetchImpl: () => Promise<Response>) {
  vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co'); vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_test');
  vi.stubGlobal('fetch', vi.fn<typeof fetch>(fetchImpl));
  const bodies = () => vi.mocked(fetch).mock.calls.map(c => JSON.parse(c[1]?.body as string) as Record<string, unknown>);
  const drain = () => act(async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); });
  return { bodies, drain };
}

/** Each press lands one second after the last, so lastPressAt is checkable. */
function setup() {
  const h = renderHook(() => usePractice(thisOldMan, false));
  const press = (pitch: number) => act(() => { vi.advanceTimersByTime(1000); h.result.current.press(pitch); });
  return { h, press };
}

describe('the session log', () => {
  it('holds one entry that reached the last note after a full run', () => {
    const { press } = setup();
    notes.forEach(n => press(n.pitch));
    expect(readSessions()).toEqual([expect.objectContaining({ pieceId: 'this-old-man', correctPresses: 30, reachedLast: true })]);
  });
  it('is up to date after every press; restart starts a new entry and leaves the old one alone', () => {
    const { h, press } = setup();
    notes.slice(0, 4).forEach(n => press(n.pitch));
    const [first] = readSessions();
    expect(readSessions()).toEqual([expect.objectContaining({ correctPresses: 4, reachedLast: false, lastPressAt: '2026-09-20T10:00:04.000Z' })]);
    act(() => h.result.current.restart());
    press(notes[0].pitch);
    expect(readSessions()).toEqual([first, expect.objectContaining({ correctPresses: 1 })]);
  });
  it('does not count one tap on the last note as a full run after Play along or a jump', () => {
    const { h, press } = setup();
    act(() => h.result.current.playAlong());
    act(() => vi.advanceTimersByTime(60_000));
    expect(h.result.current.index).toBe(notes.length - 1);
    press(notes[notes.length - 1].pitch);
    expect(readSessions()).toEqual([expect.objectContaining({ correctPresses: 1, reachedLast: false })]);
    act(() => h.result.current.goTo(notes.length - 1));
    press(notes[notes.length - 1].pitch);
    expect(readSessions()).toEqual([
      expect.objectContaining({ correctPresses: 1, reachedLast: false }),
      expect.objectContaining({ correctPresses: 1, reachedLast: false }),
    ]);
  });
  it('closes the record on the last note; a re-press or a jump starts a new one', () => {
    const { h, press } = setup();
    notes.forEach(n => press(n.pitch));
    press(notes[notes.length - 1].pitch);
    expect(readSessions()).toEqual([
      expect.objectContaining({ correctPresses: 30, reachedLast: true }),
      expect.objectContaining({ correctPresses: 1, reachedLast: false }),
    ]);
    act(() => h.result.current.restart());
    notes.slice(0, 4).forEach(n => press(n.pitch));
    act(() => h.result.current.goTo(2));
    notes.slice(2, 4).forEach(n => press(n.pitch));
    expect(readSessions().slice(2)).toEqual([
      expect.objectContaining({ correctPresses: 4, reachedLast: false }),
      expect.objectContaining({ correctPresses: 2, reachedLast: false }),
    ]);
  });
  it('ignores play-along and wrong keys', () => {
    const { h, press } = setup();
    act(() => h.result.current.playAlong());
    act(() => vi.advanceTimersByTime(60_000));
    expect(h.result.current.played.every(Boolean)).toBe(true);
    expect(readSessions()).toEqual([]);
    act(() => h.result.current.restart());
    press(wrong);
    expect(readSessions()).toEqual([]);
    press(notes[0].pitch);
    press(wrong);
    expect(readSessions()).toEqual([expect.objectContaining({ correctPresses: 1 })]);
  });
});

describe('the upload', () => {
  it('ends a full run with a row that reached the last note, sends only those seven fields, nothing for play-along or wrong keys', async () => {
    const { bodies, drain } = withBackend(() => Promise.resolve(new Response()));
    const { h, press } = setup();
    act(() => h.result.current.playAlong());
    act(() => vi.advanceTimersByTime(60_000));
    press(wrong);
    await drain();
    expect(bodies()).toEqual([]);
    act(() => h.result.current.restart());
    notes.forEach(n => press(n.pitch));
    await drain();
    expect(bodies().at(-1)).toMatchObject({ reached_last: true, correct_presses: 30, piece_id: 'this-old-man', day: '2026-09-20' });
    bodies().forEach(b => expect(Object.keys(b).sort()).toEqual(['correct_presses', 'day', 'device_id', 'piece_id', 'reached_last', 'session_id', 'updated_at']));
  });
  it('keeps the localStorage record when every request fails', async () => {
    const { bodies, drain } = withBackend(() => Promise.reject(new Error('offline')));
    const { press } = setup();
    notes.forEach(n => press(n.pitch));
    await drain();
    expect(bodies()).not.toEqual([]);
    expect(readSessions()).toEqual([expect.objectContaining({ correctPresses: 30, reachedLast: true })]);
  });
});
