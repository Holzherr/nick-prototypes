/**
 * A confirmation or sign-in link that Supabase refused comes back as
 * `#error=access_denied&error_code=otp_expired&error_description=…` — in a hash-routed app that is no route
 * at all, so the visitor landed on the homepage with nothing said. On iPhones it is the common case: the link
 * is tapped in the Gmail or Mail app, opened in one browser, tapped again from another, and the second tap
 * finds it already used.
 *
 * Read once at boot, before the first render: the hash is rewritten to #/login and the message waits here for
 * the sign-in screen to take it.
 */
let pending: string | null = null;

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
  win.history.replaceState(null, '', `${win.location.pathname}${win.location.search}#/login`);
  return pending;
}

/** The message, once; null when the visit did not come from a refused link. */
export function takeLinkProblem(): string | null {
  const message = pending;
  pending = null;
  return message;
}
