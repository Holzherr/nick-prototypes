/**
 * Invite links. The app is served under a base path on the Pages preview
 * (/nick-prototypes/strawberry-next/), so a link built from the origin alone 404s — the base has
 * to be in it. `base` defaults to whatever Vite built with.
 */
export function inviteLink(
  code: string,
  origin: string = window.location.origin,
  base: string = import.meta.env.BASE_URL,
): string {
  return `${origin}${base.replace(/\/$/, '')}/join/${code}`;
}

/** The code out of any /join/<code> path, base path or not. */
export function inviteCodeFromPath(pathname: string): string | null {
  const match = pathname.match(/\/join\/([^/?#]+)/);
  return match ? match[1] : null;
}
