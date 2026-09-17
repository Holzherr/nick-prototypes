import { cleanPath } from '@/features/analytics/events';
import { supabase } from '@/shared/supabase/client';

/**
 * One message from whoever is looking at the screen.
 *
 * Unlike the counters in analytics/events.ts this DOES run in guest mode. The promise made there is that
 * guest play is not measured; a parent choosing to type a sentence and press send is not measurement, and
 * silently dropping it would be worse than not offering the button.
 *
 * The path is stripped exactly as an event path is, because a printable's link carries a child's name.
 */
export const MESSAGE_MAX = 2000;
export const CONTACT_MAX = 200;

export interface Feedback {
  message: string;
  /** Optional: only so a reply is possible. */
  contact?: string;
  locale?: string;
}

export async function sendFeedback({ message, contact, locale }: Feedback): Promise<{ ok: boolean }> {
  const text = message.trim().slice(0, MESSAGE_MAX);
  if (!text) return { ok: false };

  const { error } = await supabase.from('maths_feedback').insert({
    message: text,
    contact: contact?.trim().slice(0, CONTACT_MAX) || null,
    path: cleanPath(window.location.hash),
    locale: locale?.slice(0, 2) ?? null,
    session: sessionStorage.getItem('maths-garden:analytics-session'),
  });
  return { ok: !error };
}
