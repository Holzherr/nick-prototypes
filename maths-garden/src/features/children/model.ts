export interface Child {
  id: string;
  name: string;
  /** yyyy-mm-dd */
  birthdate: string | null;
  avatar: string;
}

export const AVATARS = ['🌸', '🦋', '🐰', '🦄', '🐞', '⭐'] as const;

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
