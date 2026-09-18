/**
 * A confirmation or sign-in link that Supabase refused comes back as
 * `#error=access_denied&error_code=otp_expired&error_description=…` — in a hash-routed app that is no route
 * at all, so the visitor landed on the homepage with nothing said. On iPhones it is the common case: the link
 * is tapped in the Gmail or Mail app, opened in one browser, tapped again from another, and the second tap
 * finds it already used.
 *
 * Read once at boot, before the first render: the hash is rewritten to #/login and the message waits for the
 * sign-in screen to take it. It waits in sessionStorage, not only in memory, because a first visit reloads
 * the page once when the offline worker takes control — and a first visit is exactly what tapping an email
 * link on a phone usually is. Held in memory too, so taking it twice in one load gives the same answer.
 */
const KEY = 'maths-garden:link-problem';
let pending: string | null = null;

const session = () => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

const MESSAGES: Record<string, string> = {
  otp_expired:
    'That email link has expired or was already used — each link works once. If you already confirmed, just sign in below. If not, type your email and send a fresh link.',
};

export function captureLinkProblem(win: Pick<Window, 'location' | 'history'> = window): string | null {
  const raw = win.location.hash.replace(/^#\/?/, '');
  if (!/(^|&)error(_code)?=/.test(raw)) return null;
  const params = new URLSearchParams(raw);
  const code = params.get('error_code') ?? params.get('error') ?? '';
  const detail = params.get('error_description');
  pending =
    MESSAGES[code] ?? `That email link didn’t work${detail ? ` (${detail})` : ''}. Sign in below, or type your email and send a fresh confirmation link.`;
  session()?.setItem(KEY, pending);
  win.history.replaceState(null, '', `${win.location.pathname}${win.location.search}#/login`);
  return pending;
}

/** The message for this page load; null when the visit did not come from a refused link. */
export function takeLinkProblem(): string | null {
  const stored = session()?.getItem(KEY) ?? null;
  session()?.removeItem(KEY);
  pending ??= stored;
  return pending;
}

/** Once the visitor has acted on it — signed in, or sent a fresh link — it should not come back. */
export function clearLinkProblem() {
  pending = null;
  session()?.removeItem(KEY);
}
