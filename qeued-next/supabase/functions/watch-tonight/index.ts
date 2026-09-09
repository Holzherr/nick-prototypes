import { corsHeaders, json } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/db.ts';
import { MODELS, callTool, claudeErrorResponse } from '../_shared/claude.ts';

type Pick = { title: string; type: 'movie' | 'series'; year: number; genres: string[]; imdb_rating: number; explanation: string; pick_type: 'best' | 'safe' | 'wildcard' };

const moodDescriptions: Record<string, string> = {
  easy: 'light, relaxing, feel-good',
  intense: 'gripping, dark, thrilling, suspenseful',
  funny: 'comedy, humor, laughs',
  smart: 'thought-provoking, clever, intellectual',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { user_id, mood, type, time } = await req.json();
    if (!user_id || !mood || !type || !time) return json({ error: 'user_id, mood, type, and time are required' }, 400);

    const supabase = serviceClient();
    const cacheKey = `tonight:${user_id}:${mood}:${type}:${time}`;
    const { data: cached } = await supabase.from('ai_cache').select('response_data, expires_at').eq('cache_key', cacheKey).single();
    if (cached && new Date(cached.expires_at) > new Date()) return json(cached.response_data);

    const { data: watched } = await supabase.from('watch_entries').select('title:titles(name)').eq('user_id', user_id).in('status', ['watched', 'dropped']);
    // deno-lint-ignore no-explicit-any
    const excludeTitles = (watched || []).map((w: any) => w.title?.name).filter(Boolean);
    const timeDescription = time === 'short' ? 'under 2 hours for movies, limited series or short episodes' : 'epic length, long series with many seasons';

    const result = await callTool<{ picks: Pick[] }>({
      model: MODELS.smart,
      system: "You are a movie recommendation engine for 'Watch Tonight' mode. Suggest exactly 3 real movies/series. Always use the tonight_picks tool.",
      user: `Suggest 3 ${type === 'series' ? 'TV series' : 'movies'} for tonight.
Mood: ${moodDescriptions[mood] || mood}
Duration: ${timeDescription}
Exclude these already-watched titles: ${excludeTitles.join(', ') || 'none'}

Return exactly 3 picks:
1. Best pick - the perfect match for this mood
2. Safe pick - a crowd-pleaser that fits
3. Wildcard - something unexpected but fitting`,
      tool: {
        name: 'tonight_picks',
        description: 'Return 3 picks for tonight',
        input_schema: {
          type: 'object',
          properties: {
            picks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  type: { type: 'string', enum: ['movie', 'series'] },
                  year: { type: 'integer' },
                  genres: { type: 'array', items: { type: 'string' } },
                  imdb_rating: { type: 'number' },
                  explanation: { type: 'string' },
                  pick_type: { type: 'string', enum: ['best', 'safe', 'wildcard'] },
                },
                required: ['title', 'type', 'year', 'genres', 'imdb_rating', 'explanation', 'pick_type'],
                additionalProperties: false,
              },
            },
          },
          required: ['picks'],
          additionalProperties: false,
        },
      },
    });

    await supabase.from('ai_cache').upsert({ cache_key: cacheKey, response_data: result, expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() }, { onConflict: 'cache_key' });
    return json(result);
  } catch (e) {
    console.error('watch-tonight error:', e);
    return claudeErrorResponse(e, { ...corsHeaders, 'Content-Type': 'application/json' }) ?? json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});
