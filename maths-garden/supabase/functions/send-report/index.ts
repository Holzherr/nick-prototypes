// Emails a child's tutor report to the signed-in parent.
//
// The address is never sent by the app: it comes from the caller's own session, so this function can only
// ever email the person who is signed in. Deploy with:
//   npx supabase functions deploy send-report --project-ref gzdfoptvdocauvgxltjk
//   npx supabase secrets set RESEND_API_KEY=re_... REPORT_FROM='Maths Garden <onboarding@resend.dev>'
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const authorization = req.headers.get('Authorization');
  if (!authorization) return json({ error: 'Not signed in' }, 401);

  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authorization } } });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return json({ error: 'Not signed in' }, 401);

  const { subject, html, text } = await req.json().catch(() => ({}));
  if (typeof subject !== 'string' || typeof html !== 'string') return json({ error: 'subject and html are required' }, 400);

  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) return json({ error: 'Email is not set up yet (RESEND_API_KEY missing)' }, 501);

  const sent = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: Deno.env.get('REPORT_FROM') ?? 'Maths Garden <onboarding@resend.dev>',
      to: [data.user.email],
      subject: subject.slice(0, 200),
      html,
      text: typeof text === 'string' ? text : undefined,
    }),
  });

  if (!sent.ok) return json({ error: `Mail service said: ${await sent.text()}` }, 502);
  return json({ ok: true, to: data.user.email });
});
