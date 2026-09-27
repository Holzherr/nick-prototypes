import type { SessionRecord } from './sessionLog.ts';

/** Upserts the record `sessionLog.ts` just wrote onto `piano_sessions` in the Maths Garden Supabase
 *  project, for G-11's sessions_7d. With no URL and key in the build nothing leaves the device. A row
 *  is a random device id, the piece, the day and two counts: no name, no clock time, no key pressed. */
export const DEVICE_KEY = 'piano.device';

/** Safari throws on any localStorage access when storage is blocked; a press must still advance. */
export function deviceId(): string {
  let stored: string | null = null;
  try { stored = localStorage.getItem(DEVICE_KEY); } catch { /* storage blocked */ }
  if (stored) return stored;
  const id = crypto.randomUUID();
  try { localStorage.setItem(DEVICE_KEY, id); } catch { /* private window */ }
  return id;
}

/** One request in flight at most and, per run, one record waiting at most: a newer record of the same
 *  run replaces the one waiting, so the last request to complete for a run carries its newest record,
 *  after a full run the one with `reached_last: true`. Runs are keyed by id and drained oldest first,
 *  so a new run's first press cannot displace the finished run behind it. keepalive lets the last-note
 *  request finish when the tab closes on the cheer. Every failure is dropped (localStorage is the copy
 *  that matters) and still releases the queue. */
let inFlight = false;
const waiting = new Map<string, SessionRecord>();

export function syncSession(record: SessionRecord): void {
  const { VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: key } = import.meta.env;
  if (!url || !key) return;
  if (inFlight) { waiting.set(record.id, record); return; }
  inFlight = true;
  const release = () => {
    inFlight = false;
    const next = waiting.entries().next().value;
    if (next) { waiting.delete(next[0]); syncSession(next[1]); }
  };
  try {
    const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' };
    const row = { device_id: deviceId(), session_id: record.id, piece_id: record.pieceId, day: record.lastPressAt.slice(0, 10), reached_last: record.reachedLast, correct_presses: record.correctPresses, updated_at: record.lastPressAt };
    fetch(`${url}/rest/v1/piano_sessions`, { method: 'POST', keepalive: true, headers, body: JSON.stringify(row) }).catch(() => undefined).then(release);
  } catch { release(); }
}
