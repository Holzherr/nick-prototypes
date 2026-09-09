import { corsHeaders, json } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/db.ts';
import { MODELS, callTool, claudeErrorResponse } from '../_shared/claude.ts';

type CastMember = { name: string; bio: string; character_name: string; image_url: string | null };
type Enrichment = { imdb_url: string; rt_url: string; director: string; cast_members: CastMember[]; runtime_minutes: number };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { title_id } = await req.json();
    if (!title_id) return json({ error: 'title_id required' }, 400);

    const supabase = serviceClient();
    const { data: title, error: fetchErr } = await supabase.from('titles').select('*').eq('id', title_id).single();
    if (fetchErr || !title) return json({ error: 'Title not found' }, 404);

    if (title.enriched) {
      const { data: titleActors } = await supabase
        .from('title_actors')
        .select('display_order, character_name, actor_id, actors(id, name, bio, image_url)')
        .eq('title_id', title_id)
        .order('display_order');
      // deno-lint-ignore no-explicit-any
      const actors = (titleActors || []).map((ta: any) => ({ ...ta.actors, character_name: ta.character_name }));
      return json({ title, actors });
    }

    const enrichment = await callTool<Enrichment>({
      model: MODELS.fast,
      system: 'You are a movie/TV database assistant. Return accurate data. For actor image URLs, use real publicly accessible photo URLs, or null if unsure.',
      user: `For the ${title.type} "${title.name}" (${title.year || 'unknown year'}), provide:
1. The IMDb URL (format: https://www.imdb.com/title/ttXXXXXXX/)
2. The Rotten Tomatoes URL (format: https://www.rottentomatoes.com/m/slug or /tv/slug)
3. Director name
4. Top 5 cast members with: full name, a 1-2 sentence bio, the character they played, and a URL to their profile photo (a real publicly available image URL from TMDb, IMDb, or Wikipedia)
5. Runtime in minutes

If you're not sure of exact URLs, construct the most likely ones.`,
      tool: {
        name: 'enrich_title',
        description: 'Return enrichment data for a movie or series',
        input_schema: {
          type: 'object',
          properties: {
            imdb_url: { type: 'string', description: 'Full IMDb URL' },
            rt_url: { type: 'string', description: 'Full Rotten Tomatoes URL' },
            director: { type: 'string', description: 'Director name' },
            cast_members: {
              type: 'array',
              description: 'Top cast members with details',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Actor full name' },
                  bio: { type: 'string', description: '1-2 sentence bio' },
                  character_name: { type: 'string', description: 'Character played' },
                  image_url: { type: ['string', 'null'], description: 'URL to actor profile photo' },
                },
                required: ['name', 'bio', 'character_name', 'image_url'],
                additionalProperties: false,
              },
            },
            runtime_minutes: { type: 'integer', description: 'Runtime in minutes' },
          },
          required: ['imdb_url', 'rt_url', 'director', 'cast_members', 'runtime_minutes'],
          additionalProperties: false,
        },
      },
    });

    const castNames = (enrichment.cast_members || []).map((c) => c.name);
    const { error: updateErr } = await supabase
      .from('titles')
      .update({ imdb_url: enrichment.imdb_url || null, rt_url: enrichment.rt_url || null, director: enrichment.director || null, cast_members: castNames, runtime_minutes: enrichment.runtime_minutes || null, enriched: true })
      .eq('id', title_id);
    if (updateErr) console.error('Update error:', updateErr);

    // deno-lint-ignore no-explicit-any
    const actorsOut: any[] = [];
    for (let i = 0; i < (enrichment.cast_members || []).length; i++) {
      const member = enrichment.cast_members[i];
      const { data: existing } = await supabase.from('actors').select('*').eq('name', member.name).maybeSingle();
      let actor;
      if (existing) {
        if ((!existing.bio && member.bio) || (!existing.image_url && member.image_url)) {
          await supabase.from('actors').update({ bio: existing.bio || member.bio || null, image_url: existing.image_url || member.image_url || null }).eq('id', existing.id);
        }
        actor = { ...existing, bio: existing.bio || member.bio, image_url: existing.image_url || member.image_url };
      } else {
        const { data: newActor, error: actorErr } = await supabase.from('actors').insert({ name: member.name, bio: member.bio || null, image_url: member.image_url || null }).select().single();
        if (actorErr) {
          console.error('Actor insert error:', actorErr);
          continue;
        }
        actor = newActor;
      }
      await supabase.from('title_actors').upsert({ title_id, actor_id: actor.id, character_name: member.character_name || null, display_order: i }, { onConflict: 'title_id,actor_id' });
      actorsOut.push({ ...actor, character_name: member.character_name });
    }

    return json({ title: { ...title, ...enrichment, cast_members: castNames, enriched: true }, actors: actorsOut });
  } catch (e) {
    console.error('enrich-title error:', e);
    return claudeErrorResponse(e, { ...corsHeaders, 'Content-Type': 'application/json' }) ?? json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});
