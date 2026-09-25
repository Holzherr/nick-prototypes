import type { SessionRecord } from './sessionLog.ts';

/** Upserts the record `sessionLog.ts` just wrote onto `piano_sessions` in the Maths Garden Supabase
 *  project, for G-11's sessions_7d. With no URL and key in the build nothing leaves the device. A row
 *  is a random device id, the piece, the day and two counts: no name, no clock time, no key pressed. */
export const DEVICE_KEY = 'piano.device';

export function deviceId(): string {
  const stored = localStorage.getItem(DEVICE_KEY);
  if (stored) return stored;
  const id = crypto.randomUUID();
  try { localStorage.setItem(DEVICE_KEY, id); } catch { /* private window */ }
  return id;
}

/** One request in flight at most and one record waiting at most, a newer record replacing
 *  the waiting one, so the last request to complete carries the newest record: after a full
 *  run, the one with `reached_last: true`. Unordered, press 29 could land after press 30.
 *  keepalive lets the last-note request finish when the tab closes on the cheer. */
let inFlight = false;
let waiting: SessionRecord | null = null;

export function syncSession(record: SessionRecord): void {
  const { VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: key } = import.meta.env;
  if (!url || !key) return;
  if (inFlight) { waiting = record; return; }
  inFlight = true;
  // Every failure is dropped (localStorage is the copy that matters) and still releases the queue.
  post(url, key, record).catch(() => undefined).then(() => {
    inFlight = false;
    const next = waiting; waiting = null;
    if (next) syncSession(next);
  });
}

async function post(url: string, key: string, r: SessionRecord): Promise<void> {
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' };
  const row = { device_id: deviceId(), session_id: r.id, piece_id: r.pieceId, day: r.lastPressAt.slice(0, 10), reached_last: r.reachedLast, correct_presses: r.correctPresses, updated_at: r.lastPressAt };
  await fetch(`${url}/rest/v1/piano_sessions`, { method: 'POST', keepalive: true, headers, body: JSON.stringify(row) });
}
