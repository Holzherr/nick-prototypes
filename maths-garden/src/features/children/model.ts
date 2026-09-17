export interface Child {
  id: string;
  name: string;
  /** yyyy-mm-dd */
  birthdate: string | null;
  avatar: string;
}

/**
 * The pictures a child can be.
 *
 * The first eight are the homepage icons, in the same order, because a child who picked the dragon on the
 * way in then met a profile screen offering a butterfly, a rabbit and a ladybird and none of what they had
 * just chosen. Picking one of those eight here also repaints the app, which is what the homepage promised
 * when it said the icon changes the colours too.
 *
 * The rest are extra pictures with no theme behind them. Six was too few to find yourself in; a stored
 * avatar is free text, so nothing breaks for a child already wearing one that has since left the list.
 */
export const THEME_AVATARS = ['🦄', '🏎️', '🐉', '🚀', '🦕', '🐱', '⚽️', '✏️'] as const;

export const EXTRA_AVATARS = ['🌸', '🦋', '🐰', '🐞', '⭐', '🌈', '🦊', '🐼', '🐢', '🦁', '🐙', '🍀', '🐝', '🦖', '🌟', '🎨'] as const;

export const AVATARS = [...THEME_AVATARS, ...EXTRA_AVATARS] as const;

/** "4 years 3 months" from a yyyy-mm-dd birthdate, or null. */
export function ageLabel(birthdate: string | null, today = new Date()): string | null {
  if (!birthdate) return null;
  const [y, m, d] = birthdate.split('-').map(Number);
  if (!y || !m || !d) return null;
  let months = (today.getFullYear() - y) * 12 + (today.getMonth() + 1 - m);
  if (today.getDate() < d) months -= 1;
  if (months < 0) return null;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [years ? `${years} year${years === 1 ? '' : 's'}` : '', rest ? `${rest} month${rest === 1 ? '' : 's'}` : ''].filter(Boolean);
  return parts.join(' ') || 'newborn';
}

export const possessive = (name: string) => `${name}’s`;
