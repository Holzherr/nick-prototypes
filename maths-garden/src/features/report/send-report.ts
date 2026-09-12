import { supabase } from '@/shared/supabase/client';
import { readJSON, writeJSON } from '@/shared/utils/storage';
import type { TutorReport } from './report';
import { buildReportEmail, type EmailContext } from './report-email';

/**
 * Emails a report to the signed-in parent. The `send-report` edge function works out the address from the
 * caller's own session, so the app can never send to anyone else — and if the function isn't deployed the
 * app carries on, the report is still on the grown-ups screen.
 */
const SENT = 'maths-garden:report-sent';

export interface SendResult {
  ok: boolean;
  error?: string;
}

export async function sendReport(report: TutorReport, context: EmailContext): Promise<SendResult> {
  const { subject, html, text } = buildReportEmail(report, context);
  try {
    const { error } = await supabase.functions.invoke('send-report', { body: { subject, html, text } });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** One email per stage-up, per child: `${childId}:${game}:${stage}`. */
export const alreadySent = (key: string) => readJSON<string[]>(SENT, []).includes(key);
export const markSent = (key: string) => writeJSON(SENT, [...new Set([...readJSON<string[]>(SENT, []), key])].slice(-200));
