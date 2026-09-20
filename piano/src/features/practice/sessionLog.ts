/** A practice session, stored on every correct press so a tab closed or backgrounded
 *  mid-run has already kept everything up to the last press. It never leaves the device. */
export interface SessionRecord {
  id: string;
  pieceId: string;
  startedAt: string;
  lastPressAt: string;
  correctPresses: number;
  reachedLast: boolean;
}

export const SESSIONS_KEY = 'piano.sessions';
const KEEP = 100;

export function readSessions(): SessionRecord[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? '[]');
    return Array.isArray(parsed) ? (parsed as SessionRecord[]) : [];
  } catch { return []; }
}

/** Insert or replace `record` by id, keeping the KEEP most recent entries. */
export function writeSession(record: SessionRecord): void {
  const next = [...readSessions().filter(s => s.id !== record.id), record].slice(-KEEP);
  try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(next)); } catch { /* private window */ }
}

/** Store one correct press: extends `prev`, or starts a fresh record when it is null. */
export function logPress(prev: SessionRecord | null, pieceId: string, last: boolean, now: Date): SessionRecord {
  const at = now.toISOString();
  const id = `${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const record = prev
    ? { ...prev, lastPressAt: at, correctPresses: prev.correctPresses + 1, reachedLast: prev.reachedLast || last }
    : { id, pieceId, startedAt: at, lastPressAt: at, correctPresses: 1, reachedLast: last };
  writeSession(record);
  return record;
}

/** Sessions whose last press falls within `days` of `now`. */
export function sessionsIn(days: number, now: Date, sessions = readSessions()): number {
  const since = now.getTime() - days * 86_400_000;
  return sessions.filter(s => Date.parse(s.lastPressAt) >= since && Date.parse(s.lastPressAt) <= now.getTime()).length;
}
