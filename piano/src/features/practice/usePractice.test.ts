import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { thisOldMan } from '@/features/score/pieces/this-old-man.ts';
import { readSessions } from './sessionLog.ts';
import { usePractice } from './usePractice.ts';

const notes = thisOldMan.notes;
const wrong = 61; // a black key; the piece has no sharps or flats

beforeEach(() => { localStorage.clear(); vi.useFakeTimers({ now: new Date('2026-09-20T10:00:00Z') }); });
afterEach(() => vi.useRealTimers());

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
