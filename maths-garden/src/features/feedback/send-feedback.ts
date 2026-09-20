import { cleanPath } from '@/features/analytics/events';
import { supabase } from '@/shared/supabase/client';
import { isKind, isReporter, type Kind, type Reporter } from './reporter';

/**
 * One message from whoever is looking at the screen.
 *
 * Unlike the counters in analytics/events.ts this DOES run in guest mode. The promise made there is that
 * guest play is not measured; a parent choosing to type a sentence and press send is not measurement, and
 * silently dropping it would be worse than not offering the button.
 *
 * The path is stripped exactly as an event path is, because a printable's link carries a child's name.
 *
 * `reporter` and `kind` arrive with migration 0007. Until it is applied the insert that carries them is
 * refused by the database, so a refusal is followed by one retry without them: the message matters more
 * than its label, and the label can be read from the message until the columns exist.
 */
export const MESSAGE_MAX = 2000;
export const CONTACT_MAX = 200;

export interface Feedback {
  message: string;
  /** Optional: only so a reply is possible. */
  contact?: string;
  locale?: string;
  /** Who is typing — one of the three the picker offers, or nothing. */
  reporter?: Reporter | null;
  /** What sort of note it is, or nothing. */
  kind?: Kind | null;
}

export async function sendFeedback({ message, contact, locale, reporter, kind }: Feedback): Promise<{ ok: boolean }> {
  const text = message.trim().slice(0, MESSAGE_MAX);
  if (!text) return { ok: false };

  const row = {
    message: text,
    contact: contact?.trim().slice(0, CONTACT_MAX) || null,
    path: cleanPath(window.location.hash),
    locale: locale?.slice(0, 2) ?? null,
    session: sessionStorage.getItem('maths-garden:analytics-session'),
  };
  // Only the labels actually chosen are named: a null in a column the database does not have yet is still
  // a column it does not have.
  const labels: { reporter?: Reporter; kind?: Kind } = {};
  if (isReporter(reporter)) labels.reporter = reporter;
  if (isKind(kind)) labels.kind = kind;
  const labelled = Object.keys(labels).length > 0;

  const { error } = await supabase.from('maths_feedback').insert({ ...row, ...labels });
  if (!error) return { ok: true };
  if (!labelled) return { ok: false };

  const retry = await supabase.from('maths_feedback').insert(row);
  return { ok: !retry.error };
}
