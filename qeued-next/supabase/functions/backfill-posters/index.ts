import { corsHeaders, json } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/db.ts';
import { fetchPosterUrl } from '../_shared/posters.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabase = serviceClient();
    const { data: titles } = await supabase.from('titles').select('id, name, type, year').is('image_url', null).limit(50);
    if (!titles || titles.length === 0) return json({ message: 'No titles need backfilling', updated: 0 });

    let updated = 0;
    // Batches of 5 to be polite to Wikipedia.
    for (let i = 0; i < titles.length; i += 5) {
      const batch = titles.slice(i, i + 5);
      const results = await Promise.all(batch.map(async (t) => ({ id: t.id, url: await fetchPosterUrl(t.name, t.type, t.year || 2000) })));
      for (const r of results) {
        if (r.url) {
          await supabase.from('titles').update({ image_url: r.url }).eq('id', r.id);
          updated++;
        }
      }
    }
    return json({ message: `Backfilled ${updated}/${titles.length} titles`, updated });
  } catch (e) {
    console.error('backfill-posters error:', e);
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});
