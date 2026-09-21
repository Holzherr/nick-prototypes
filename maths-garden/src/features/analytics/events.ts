import { cloudConfigured, supabase } from '@/shared/supabase/client';

/**
 * Anonymous, first-party counting: how many people arrive, sign up and play.
 *
 * No cookies, no third party, and no identifier that outlives the tab — the session id is random and lives
 * in `sessionStorage`. Nothing recorded can identify a child: `cleanPath` drops every query parameter but a
 * sheet's id and stage, because a printable's link carries the child's NAME and avatar.
 *
 * Guest mode records nothing at all. The homepage promises "Guest mode keeps everything on the device and
 * sends nothing anywhere", and keeping that promise is worth more than the numbers.
 */
/** `offer_taken` / `offer_skipped`: a start from home was, or was not, the game home suggested. */
export type EventName = 'visit' | 'signup' | 'sign_in' | 'guest_start' | 'game_start' | 'round_done' | 'offer_taken' | 'offer_skipped';

const SESSION_KEY = 'maths-garden:analytics-session';
const GUEST_KEY = 'maths-garden:guest';

/** The only query parameters ever recorded. `name` and `icon` describe a child and must never be kept. */
const KEEP = ['id', 'stage'] as const;

/** A hash route reduced to something safe to store: no child's name, no avatar, no free text. */
export function cleanPath(hash: string): string {
  const [path, query = ''] = (hash.replace(/^#/, '') || '/').split('?');
  const from = new URLSearchParams(query);
  const kept = new URLSearchParams();
  for (const key of KEEP) {
    const value = from.get(key);
    if (value) kept.set(key, value.slice(0, 32));
  }
  const rest = kept.toString();
  return `${path}${rest ? `?${rest}` : ''}`.slice(0, 120);
}

/** Playing without an account: nothing at all is recorded, by promise. */
const guesting = () => {
  try {
    return localStorage.getItem(GUEST_KEY) === 'true';
  } catch {
    return false;
  }
};

const sessionId = (): string | null => {
  try {
    const found = sessionStorage.getItem(SESSION_KEY);
    if (found) return found;
    const made = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, made);
    return made;
  } catch {
    return null;
  }
};

/** Where a visitor arrived from, host only — never the full URL, which can carry someone else's query. */
const referrerHost = (): string | null => {
  try {
    if (!document.referrer) return null;
    const { host } = new URL(document.referrer);
    return host && host !== window.location.host ? host.slice(0, 120) : null;
  } catch {
    return null;
  }
};

const optedOut = () => {
  try {
    return (navigator as { doNotTrack?: string | null }).doNotTrack === '1';
  } catch {
    return false;
  }
};

let lastVisit = '';

/**
 * Record one anonymous event. Never throws, never blocks and never surfaces a failure: a counter must not
 * be able to spoil a round, and there is nothing a child or a parent could do about it if it did.
 */
export function track(name: EventName, path: string = cleanPath(window.location.hash)): void {
  if (!cloudConfigured || optedOut() || guesting()) return;
  if (window.location.hostname === 'localhost') return;
  // Hash routes re-render on any parameter change; a page counts once per path in a row, not per render.
  if (name === 'visit') {
    if (lastVisit === path) return;
    lastVisit = path;
  }
  try {
    void supabase
      .from('maths_events')
      .insert({ name, path, ref: name === 'visit' ? referrerHost() : null, session: sessionId() })
      .then(
        () => undefined,
        () => undefined,
      );
  } catch {
    // Counting is never worth an error.
  }
}
