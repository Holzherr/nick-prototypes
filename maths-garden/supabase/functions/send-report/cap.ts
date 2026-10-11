// How many reports one account may be mailed in a day.
//
// Every send costs a Resend email, and with sign-up confirmation off anyone can open an account under any
// address. An address holds one account, so a cap per account is a cap per inbox: a stranger's address gets
// at most MAX_SENDS of our emails a day however often the function is called. A parent with three children
// levelling up in a day sends well under it.

export const MAX_SENDS = 10;
export const WINDOW_MS = 24 * 60 * 60 * 1000;

/** The send times to keep, `now` included, when one more may go; null when the account is at the cap. */
export function nextSends(previous: unknown, now: number): number[] | null {
  const recent = (Array.isArray(previous) ? previous : []).filter((t): t is number => typeof t === 'number' && t > now - WINDOW_MS && t <= now);
  return recent.length >= MAX_SENDS ? null : [...recent, now];
}
