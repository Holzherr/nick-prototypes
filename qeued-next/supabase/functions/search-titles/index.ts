import { corsHeaders, json } from '../_shared/cors.ts';
import { serviceClient, userIdFromJwt } from '../_shared/db.ts';
import { HttpError, resolveCaller } from '../_shared/access.ts';

/**
 * Search reads the catalogue and nothing else.
 *
 * No model names titles here: what the catalogue holds comes from a source page via the
 * wave, and an invented title is retired, never published (DECISIONS.md, 2026-09). A query
 * with no hit is queued as a catalogue candidate for the wave to resolve, typed `movie`
 * because the column is not null; a wrong guess is retired with a reason after two
 * attempts, the rule for every other candidate.
 */

const MAX_QUERY = 120;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { query, user_id: bodyUserId } = await req.json().catch(() => ({}));
    // The caller comes from the JWT; the anon key alone is a 401.
    await resolveCaller(req, { serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), getUserId: userIdFromJwt, bodyUserId });

    const q = typeof query === 'string' ? query.trim().slice(0, MAX_QUERY).trim() : '';
    if (q.length < 2) return json({ error: 'Query must be at least 2 characters' }, 400);

    const supabase = serviceClient();
    const { data: titles, error } = await supabase.from('titles').select('*').ilike('name', `%${q}%`).limit(10);
    if (error) throw error;
    if (titles && titles.length > 0) return json({ titles, source: 'catalogue' });

    // The unique index on (lower(name), year, type) makes a repeat a 23505: already queued.
    const { error: queueError } = await supabase.from('catalogue_candidates').insert({
      name: q, year: null, type: 'movie', priority: 2, bucket: 'search',
      note: 'typed into search; type unknown, the resolver decides',
    });
    if (queueError && queueError.code !== '23505') throw queueError;
    return json({ titles: [], source: 'queued' });
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error('search-titles error:', e);
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});
