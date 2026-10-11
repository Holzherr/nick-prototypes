// Emails a child's tutor report to the signed-in parent.
//
// The address is never sent by the app: it comes from the caller's own session. With sign-up confirmation
// off every address counts as confirmed, so that is not proof anyone owns the inbox; the link check and the
// daily cap (cap.ts) bound what a stranger's address can receive. Deploy with:
//   npx supabase functions deploy send-report --project-ref <project-ref>
//   npx supabase secrets set RESEND_API_KEY=re_... REPORT_FROM='Maths Garden <onboarding@resend.dev>' \
//     REPORT_ORIGINS='https://example.com,http://localhost:5173'
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { nextSends } from './cap.ts';
import { foreignLinks } from './links.ts';

// The report is a few KB; anything near these caps is not a report.
const MAX_SUBJECT = 200;
const MAX_HTML = 60_000;
const MAX_TEXT = 20_000;

const ORIGINS = (Deno.env.get('REPORT_ORIGINS') ?? '').split(',').map((o) => o.trim()).filter(Boolean);

const cors = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && ORIGINS.includes(origin) ? origin : ORIGINS[0] ?? 'null',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  Vary: 'Origin',
});

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin');
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors(origin), 'Content-Type': 'application/json' } });

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(origin) });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (origin && !ORIGINS.includes(origin)) return json({ error: 'Origin not allowed' }, 403);

  const authorization = req.headers.get('Authorization');
  if (!authorization) return json({ error: 'Not signed in' }, 401);

  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authorization } } });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return json({ error: 'Not signed in' }, 401);
  if (!data.user.email_confirmed_at) return json({ error: 'Confirm your email address first' }, 403);

  const { subject, html, text } = await req.json().catch(() => ({}));
  if (typeof subject !== 'string' || typeof html !== 'string') return json({ error: 'subject and html are required' }, 400);
  if (subject.length > MAX_SUBJECT || html.length > MAX_HTML || (typeof text === 'string' && text.length > MAX_TEXT)) {
    return json({ error: 'Report too large' }, 413);
  }
  if (foreignLinks(html, typeof text === 'string' ? text : undefined, ORIGINS).length) {
    return json({ error: 'A report may only link to the app' }, 400);
  }

  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) return json({ error: 'Email is not set up yet (RESEND_API_KEY missing)' }, 501);

  // The send log lives in app_metadata, which the caller cannot write; getUser read it fresh from the server.
  // Logged before sending, so a failed send still counts and retrying cannot get round the cap.
  const sends = nextSends(data.user.app_metadata?.report_sends, Date.now());
  if (!sends) return json({ error: 'That is enough reports for today. Try again tomorrow.' }, 429);
  const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const logged = await admin.auth.admin.updateUserById(data.user.id, { app_metadata: { report_sends: sends } });
  if (logged.error) {
    console.error('report_sends', logged.error.message);
    return json({ error: 'The report could not be sent' }, 500);
  }

  const sent = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: Deno.env.get('REPORT_FROM') ?? 'Maths Garden <onboarding@resend.dev>',
      to: [data.user.email],
      subject: subject.replace(/[\r\n]+/g, ' '),
      html,
      text: typeof text === 'string' ? text : undefined,
    }),
  });

  if (!sent.ok) {
    console.error('resend', sent.status, await sent.text());
    return json({ error: 'The report could not be sent' }, 502);
  }
  return json({ ok: true, to: data.user.email });
});
