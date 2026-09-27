import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { thisOldMan } from '@/features/score/pieces/this-old-man.ts';
import { readSessions } from './sessionLog.ts';
import { usePractice } from './usePractice.ts';

const synth = vi.hoisted(() => ({ play: vi.fn(), click: vi.fn(), cheer: vi.fn() }));
vi.mock('@/features/audio/useSynth.ts', () => ({ useSynth: () => synth }));

const notes = thisOldMan.notes;
const wrong = 61; // a black key; the piece has no sharps or flats
const beat = 60000 / thisOldMan.tempoBpm;
/** ms after playAlong() at which note i lights (after the count-in), and at which the final cheer lands. */
const lit = (i: number) => Math.ceil((thisOldMan.beatsPerBar + notes[i].onset) * beat);
const end = Math.ceil((thisOldMan.beatsPerBar + notes[notes.length - 1].onset + notes[notes.length - 1].duration) * beat) + 200;

beforeEach(() => { localStorage.clear(); synth.cheer.mockClear(); vi.useFakeTimers({ now: new Date('2026-09-20T10:00:00Z') }); });
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
  it('does not count one tap on the last note as a full run after a jump', () => {
    const { h, press } = setup();
    act(() => h.result.current.goTo(notes.length - 1));
    press(notes[notes.length - 1].pitch);
    expect(readSessions()).toEqual([expect.objectContaining({ correctPresses: 1, reachedLast: false })]);
  });
  it('closes the record on the last note; a jump starts a new one', () => {
    const { h, press } = setup();
    notes.forEach(n => press(n.pitch));
    expect(readSessions()).toEqual([expect.objectContaining({ correctPresses: 30, reachedLast: true })]);
    act(() => h.result.current.restart());
    notes.slice(0, 4).forEach(n => press(n.pitch));
    act(() => h.result.current.goTo(2));
    notes.slice(2, 4).forEach(n => press(n.pitch));
    expect(readSessions().slice(1)).toEqual([
      expect.objectContaining({ correctPresses: 4, reachedLast: false }),
      expect.objectContaining({ correctPresses: 2, reachedLast: false }),
    ]);
  });
  it('ignores play-along and wrong keys', () => {
    const { h, press } = setup();
    act(() => h.result.current.playAlong());
    act(() => vi.advanceTimersByTime(end));
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

describe('the end of a run', () => {
  it('cheers once, ignores a re-press of the last key, then goes back to the start for a new run', async () => {
    const { bodies, drain } = withBackend(() => Promise.resolve(new Response()));
    const { h, press } = setup();
    notes.forEach(n => press(n.pitch));
    await drain();
    const sent = bodies().length;
    expect(readSessions()).toEqual([expect.objectContaining({ correctPresses: 30, reachedLast: true })]);
    expect(synth.cheer).toHaveBeenCalledTimes(1);
    press(notes[notes.length - 1].pitch); // 1000 ms after the last correct press
    await drain();
    expect(readSessions()).toHaveLength(1);
    expect(bodies()).toHaveLength(sent);
    expect(synth.cheer).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(500));
    expect(h.result.current.index).toBe(0);
    expect(h.result.current.played.some(Boolean)).toBe(false);
    press(notes[0].pitch);
    expect(readSessions()[1]).toMatchObject({ correctPresses: 1 });
  });
  it('a jump within the pause cancels the reset', () => {
    const { h, press } = setup();
    notes.forEach(n => press(n.pitch));
    act(() => h.result.current.goTo(5));
    act(() => vi.advanceTimersByTime(3000));
    expect(h.result.current.index).toBe(5);
  });
});

describe('play along', () => {
  it('only sounds a key tapped along with it: no log, no upload, no change to the lit notes', async () => {
    const { bodies, drain } = withBackend(() => Promise.resolve(new Response()));
    const { h } = setup();
    act(() => h.result.current.playAlong());
    let elapsed = 0;
    notes.forEach((n, i) => {
      act(() => vi.advanceTimersByTime(lit(i) - elapsed));
      elapsed = lit(i);
      const { index, played } = h.result.current;
      act(() => h.result.current.press(n.pitch));
      expect(h.result.current.playing).toBe(true);
      expect(h.result.current.index).toBe(index);
      expect(h.result.current.played).toEqual(played);
    });
    await drain();
    expect(readSessions()).toEqual([]);
    expect(bodies()).toEqual([]);
  });
  it('goes back to the start after its cheer, so a second play along begins at the first note', () => {
    const { h } = setup();
    act(() => h.result.current.playAlong());
    act(() => vi.advanceTimersByTime(end + 1500));
    expect(h.result.current.playing).toBe(false);
    expect(h.result.current.index).toBe(0);
    expect(h.result.current.played.some(Boolean)).toBe(false);
    act(() => h.result.current.playAlong());
    act(() => vi.advanceTimersByTime(lit(0)));
    expect(h.result.current.index).toBe(0);
    expect(h.result.current.played).toEqual(notes.map((_, i) => i === 0));
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
