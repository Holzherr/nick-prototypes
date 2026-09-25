import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SessionRecord } from './sessionLog.ts';
import { DEVICE_KEY, deviceId, syncSession } from './sessionSync.ts';

const url = 'https://example.supabase.co', key = 'sb_publishable_test';
const record = (correctPresses: number): SessionRecord =>
  ({ id: 'run-1', pieceId: 'this-old-man', startedAt: '2026-09-20T10:00:00.000Z', lastPressAt: `2026-09-20T10:00:0${correctPresses}.000Z`, correctPresses, reachedLast: false });
const flush = () => new Promise(r => setTimeout(r, 0));

/** A fetch the test settles by hand, in the order the requests were made. */
const settle: { resolve: () => void; reject: () => void }[] = [];
const mock = vi.fn<typeof fetch>(() => new Promise((resolve, reject) => settle.push({ resolve: () => resolve(new Response()), reject: () => reject(new Error('offline')) })));
const body = (n: number) => JSON.parse(mock.mock.calls[n][1]?.body as string) as Record<string, unknown>;

beforeEach(() => { localStorage.clear(); mock.mockClear(); vi.stubGlobal('fetch', mock); vi.stubEnv('VITE_SUPABASE_URL', url); vi.stubEnv('VITE_SUPABASE_ANON_KEY', key); });
/** Settles whatever is still pending, so the queue is empty for the next test. */
afterEach(async () => { while (settle.length) { settle.shift()?.resolve(); await flush(); } vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('sessionSync', () => {
  it('makes a device UUID once, stores it under piano.device and returns the same one after', () => {
    const id = deviceId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(localStorage.getItem(DEVICE_KEY)).toBe(id);
    expect(deviceId()).toBe(id);
  });
  it('sends nothing when the build has no Supabase URL', () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    syncSession(record(1));
    expect(mock).not.toHaveBeenCalled();
  });
  it('upserts the record onto piano_sessions with the key, merge-duplicates and keepalive', () => {
    syncSession(record(1));
    expect(mock).toHaveBeenCalledExactlyOnceWith(`${url}/rest/v1/piano_sessions`, expect.objectContaining({ method: 'POST', keepalive: true,
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' } }));
    expect(body(0)).toEqual({ device_id: deviceId(), session_id: 'run-1', piece_id: 'this-old-man', day: '2026-09-20', reached_last: false, correct_presses: 1, updated_at: '2026-09-20T10:00:01.000Z' });
  });
  it('keeps one request in flight and sends only the newest record once it settles', async () => {
    [1, 2, 3].forEach(n => syncSession(record(n)));
    await flush();
    expect(mock).toHaveBeenCalledTimes(1);
    settle[0].resolve();
    await flush();
    expect(mock).toHaveBeenCalledTimes(2);
    expect(body(1).correct_presses).toBe(3);
  });
  it('still sends the waiting record when the request before it fails, and never throws', async () => {
    [1, 2].forEach(n => syncSession(record(n)));
    settle[0].reject();
    await flush();
    expect(mock).toHaveBeenCalledTimes(2);
    expect(body(1).correct_presses).toBe(2);
  });
});
