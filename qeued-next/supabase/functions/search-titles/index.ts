import { corsHeaders, json } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/db.ts';
import { MODELS, callTool, claudeErrorResponse } from '../_shared/claude.ts';
import { fetchPosterUrl } from '../_shared/posters.ts';

type Found = { name: string; type: 'movie' | 'series'; genres: string[]; imdb_rating: number; rt_rating?: number | null; description: string; year: number };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string' || query.trim().length < 2) return json({ error: 'Query must be at least 2 characters' }, 400);

    const supabase = serviceClient();
    const { data: cached } = await supabase.from('titles').select('*').ilike('name', `%${query.trim()}%`).limit(10);
    if (cached && cached.length > 0) return json({ titles: cached, source: 'cache' });

    const { titles } = await callTool<{ titles: Found[] }>({
      model: MODELS.fast,
      system: 'You are a movie and TV series database. When asked to search for titles, return accurate real-world data about movies and TV series. Always use the search_results tool to return structured data.',
      user: `Search for movies and TV series matching: "${query.trim()}". Return up to 5 results with accurate real-world data.`,
      tool: {
        name: 'search_results',
        description: 'Return search results for movies and TV series',
        input_schema: {
          type: 'object',
          properties: {
            titles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string', enum: ['movie', 'series'] },
                  genres: { type: 'array', items: { type: 'string' } },
                  imdb_rating: { type: 'number' },
                  rt_rating: { type: ['integer', 'null'] },
                  description: { type: 'string' },
                  year: { type: 'integer' },
                },
                required: ['name', 'type', 'genres', 'imdb_rating', 'rt_rating', 'description', 'year'],
                additionalProperties: false,
              },
            },
          },
          required: ['titles'],
          additionalProperties: false,
        },
      },
    });

    const posters = await Promise.all((titles ?? []).map((t) => fetchPosterUrl(t.name, t.type, t.year)));
    const stored = [];
    for (let i = 0; i < titles.length; i++) {
      const t = titles[i];
      const { data: inserted, error } = await supabase
        .from('titles')
        .insert({ name: t.name, type: t.type, genres: t.genres, imdb_rating: t.imdb_rating, rt_rating: t.rt_rating ?? null, description: t.description, year: t.year, image_url: posters[i] ?? null })
        .select()
        .single();
      if (inserted) stored.push(inserted);
      else if (error) console.error('Insert error:', error);
    }
    return json({ titles: stored.length > 0 ? stored : titles, source: 'ai' });
  } catch (e) {
    console.error('search-titles error:', e);
    return claudeErrorResponse(e, { ...corsHeaders, 'Content-Type': 'application/json' }) ?? json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});
