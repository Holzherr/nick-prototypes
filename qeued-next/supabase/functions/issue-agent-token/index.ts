import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { corsHeaders, json } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/db.ts';

/**
 * Mints an agent token for a profile the caller controls.
 *
 * The token is returned once and stored only as a SHA-256 hash, so the row is useless to
 * anyone who reads the table. Issuing runs here rather than in the browser because
 * agent_tokens deliberately has no insert policy — a client that could write its own rows
 * could write them for someone else's profile.
 */

const sha256 = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

const newToken = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const base64 = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `qeu_${base64}`;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader) return json({ error: 'Not signed in' }, 401);

    // Read the caller's identity with their own JWT, never the service key.
    const asCaller = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await asCaller.auth.getUser();
    if (!user) return json({ error: 'Not signed in' }, 401);

    const { profile_id, label, scopes } = await req.json();
    if (!profile_id) return json({ error: 'profile_id required' }, 400);

    const db = serviceClient();
    const { data: profile } = await db
      .from('profiles')
      .select('id, user_id, owner_user_id')
      .eq('id', profile_id)
      .maybeSingle();

    if (!profile || (profile.user_id !== user.id && profile.owner_user_id !== user.id)) {
      return json({ error: 'That profile is not yours' }, 403);
    }

    const token = newToken();
    const { error } = await db.from('agent_tokens').insert({
      token_hash: await sha256(token),
      profile_id,
      label: typeof label === 'string' && label.trim() ? label.trim().slice(0, 80) : 'assistant',
      scopes: Array.isArray(scopes) && scopes.length ? scopes : ['read', 'write'],
    });
    if (error) return json({ error: error.message }, 500);

    return json({ token });
  } catch (e) {
    console.error('issue-agent-token error:', e);
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});
