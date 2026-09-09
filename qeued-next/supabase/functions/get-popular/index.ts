import { corsHeaders, json } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/db.ts';
import { MODELS, callTool } from '../_shared/claude.ts';
import { fetchPosterUrl } from '../_shared/posters.ts';

const CACHE_KEY = 'popular:global';
const CACHE_HOURS = 24;

type Popular = { title: string; type: 'movie' | 'series'; year: number; genres: string[]; imdb_rating: number; description: string; image_url?: string | null };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabase = serviceClient();
    const { data: cached } = await supabase.from('ai_cache').select('response_data, expires_at').eq('cache_key', CACHE_KEY).single();
    if (cached && new Date(cached.expires_at) > new Date()) return json(cached.response_data);

    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const forceRefresh = body.refresh === true;
    if (cached && !forceRefresh) return json(cached.response_data);

    const currentDate = new Date().toISOString().split('T')[0];
    let result: { titles: Popular[] };
    try {
      result = await callTool<{ titles: Popular[] }>({
        model: MODELS.fast,
        system: 'You are a movie/TV expert. Return currently popular and trending movies and series that people are talking about right now. Use accurate real data. Always use the popular tool.',
        user: `Today is ${currentDate}. List the top 12 most popular/trending movies and TV series right now globally. Mix of both movies and series. Include recent releases and currently airing shows. Focus on what's actually trending on streaming platforms, in cinemas, and in cultural conversation right now.`,
        tool: {
          name: 'popular',
          description: 'Return popular titles',
          input_schema: {
            type: 'object',
            properties: {
              titles: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    type: { type: 'string', enum: ['movie', 'series'] },
                    year: { type: 'integer' },
                    genres: { type: 'array', items: { type: 'string' } },
                    imdb_rating: { type: 'number' },
                    description: { type: 'string', description: "One sentence about why it's popular right now" },
                  },
                  required: ['title', 'type', 'year', 'genres', 'imdb_rating', 'description'],
                  additionalProperties: false,
                },
              },
            },
            required: ['titles'],
            additionalProperties: false,
          },
        },
      });
    } catch (e) {
      // AI failed: serve the stale cache if there is one.
      if (cached) return json(cached.response_data);
      throw e;
    }

    result.titles = await Promise.all((result.titles ?? []).map(async (item) => ({ ...item, image_url: await fetchPosterUrl(item.title, item.type, item.year) })));
    await supabase.from('ai_cache').upsert({ cache_key: CACHE_KEY, response_data: result, expires_at: new Date(Date.now() + CACHE_HOURS * 60 * 60 * 1000).toISOString() }, { onConflict: 'cache_key' });
    return json(result);
  } catch (e) {
    console.error('get-popular error:', e);
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});
