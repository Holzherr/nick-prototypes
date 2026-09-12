/** Household logic: who wants what, and what a given profile is allowed to be shown. */

export type Profile = {
  id: string;
  name: string | null;
  /** Null for a managed profile — a child who has no login of their own. */
  user_id: string | null;
  owner_user_id: string | null;
  max_certification: string | null;
  avatar_url?: string | null;
  colour?: string | null;
};

export type MemberEntry = {
  profile_id: string;
  title_id: string;
  title_name: string;
  status: string;
  genres: string[];
  certification?: string | null;
  image_url?: string | null;
};

export type SharedItem = {
  title_id: string;
  title_name: string;
  genres: string[];
  certification: string | null;
  image_url: string | null;
  /** Profiles with this on their want-to-watch list. */
  wanted_by: string[];
};

export const isManaged = (profile: Profile): boolean => profile.owner_user_id !== null;

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
export const certificationAllowed = (certification: string | null | undefined, max: string | null): boolean => {
  if (!max) return true;
  const limit = certificationRank(max);
  if (limit === CERT_ORDER.length) return true;
  return certificationRank(certification) <= limit;
};

/**
 * The group's queue: every title someone wants, with who wants it. Titles more than one
 * person wants come first — that agreement is the whole reason the group exists.
 */
export const sharedQueue = (entries: MemberEntry[], forProfile?: Profile): SharedItem[] => {
  const byTitle = new Map<string, SharedItem>();
  for (const entry of entries) {
    if (entry.status !== 'want_to_watch') continue;
    const existing = byTitle.get(entry.title_id);
    if (existing) {
      if (!existing.wanted_by.includes(entry.profile_id)) existing.wanted_by.push(entry.profile_id);
      continue;
    }
    byTitle.set(entry.title_id, {
      title_id: entry.title_id,
      title_name: entry.title_name,
      genres: entry.genres ?? [],
      certification: entry.certification ?? null,
      image_url: entry.image_url ?? null,
      wanted_by: [entry.profile_id],
    });
  }
  const items = [...byTitle.values()].filter(
    (item) => !forProfile || certificationAllowed(item.certification, forProfile.max_certification),
  );
  return items.sort((a, b) => b.wanted_by.length - a.wanted_by.length || a.title_name.localeCompare(b.title_name));
};

/** Titles everyone in the group wants — the ones you can start without negotiating. */
export const unanimous = (queue: SharedItem[], memberIds: string[]): SharedItem[] =>
  memberIds.length < 2 ? [] : queue.filter((item) => memberIds.every((id) => item.wanted_by.includes(id)));

export const displayName = (profile: Profile): string => profile.name?.trim() || 'Unnamed';

/** Initials for the avatar fallback: "Tara Holzherr" becomes TH, a single name gives one letter. */
export const initials = (profile: Profile): string =>
  displayName(profile)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
