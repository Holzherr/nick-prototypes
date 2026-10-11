/**
 * UK certificate caps for managed profiles (a child's list).
 *
 * Shared by the app (src/features/household/model.ts re-exports it) and the edge functions,
 * so the screen and the server agree on what a capped profile may be shown. No Deno globals
 * and no remote imports, so vitest can load it directly.
 */

/** UK certificates, loosest first. Anything unrecognised sorts last — unknown is not safe. */
const CERT_ORDER = ['U', 'PG', '12', '12A', '15', '18'];

export const certificationRank = (certification: string | null | undefined): number => {
  if (!certification) return CERT_ORDER.length;
  const index = CERT_ORDER.indexOf(certification.toUpperCase());
  return index === -1 ? CERT_ORDER.length : index;
};

/**
 * May this profile be shown this title? A profile with no limit sees everything; a limited
 * profile sees titles at or below its cap, and never an unrated one — we can't vouch for it.
 */
export const certificationAllowed = (certification: string | null | undefined, max: string | null | undefined): boolean => {
  if (!max) return true;
  const limit = certificationRank(max);
  if (limit === CERT_ORDER.length) return true;
  return certificationRank(certification) <= limit;
};

/** Allowed under every cap given — a shared slate has to suit everyone watching. */
export const allowedForAll = (certification: string | null | undefined, caps: (string | null | undefined)[]): boolean =>
  caps.every((cap) => certificationAllowed(certification, cap));
