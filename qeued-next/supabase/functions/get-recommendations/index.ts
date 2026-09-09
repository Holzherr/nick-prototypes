import { corsHeaders, json } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/db.ts';
import { MODELS, callTool, claudeErrorResponse } from '../_shared/claude.ts';
import { fetchPosterUrl } from '../_shared/posters.ts';

type Rec = { title: string; type: 'movie' | 'series'; year: number; genres: string[]; imdb_rating: number; match_score: number; explanation: string; image_url?: string | null };
type Result = { personal: Rec[]; shared: Rec[] | null };

const recItem = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    type: { type: 'string', enum: ['movie', 'series'] },
    year: { type: 'integer' },
    genres: { type: 'array', items: { type: 'string' } },
    imdb_rating: { type: 'number' },
    match_score: { type: 'integer', description: '0-100' },
    explanation: { type: 'string' },
  },
  required: ['title', 'type', 'year', 'genres', 'imdb_rating', 'match_score', 'explanation'],
  additionalProperties: false,
} as const;

const moodDescriptions: Record<string, string> = {
  easy: 'light, relaxing, feel-good',
  intense: 'gripping, dark, thrilling, suspenseful',
  funny: 'comedy, humor, laughs',
  smart: 'thought-provoking, clever, intellectual',
};
const timeDescriptions: Record<string, string> = {
  short: 'under 2 hours for movies, limited series or short episodes',
  long: 'epic length, long series with many seasons',
};

// deno-lint-ignore no-explicit-any
const toHistory = (rows: any[] | null) =>
  (rows || []).map((e) => ({ title: e.title?.name, status: e.status, rating: e.watched_rating, genres: e.title?.genres, imdb: e.title?.imdb_rating }));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { user_id, partner_id, exclude_titles, mood, type_filter, time_filter } = await req.json();
    if (!user_id) return json({ error: 'user_id required' }, 400);

    const supabase = serviceClient();
    const hasExclusions = Array.isArray(exclude_titles) && exclude_titles.length > 0;
    const filterSuffix = [mood, type_filter, time_filter].filter(Boolean).join(':');
    const cacheKey = partner_id
      ? `recs:${[user_id, partner_id].sort().join(':')}${filterSuffix ? `:${filterSuffix}` : ''}`
      : `recs:${user_id}${filterSuffix ? `:${filterSuffix}` : ''}`;
    if (!hasExclusions) {
      const { data: cached } = await supabase.from('ai_cache').select('response_data, expires_at').eq('cache_key', cacheKey).single();
      if (cached && new Date(cached.expires_at) > new Date()) return json(cached.response_data);
    }

    const { data: entries } = await supabase.from('watch_entries').select('status, watched_rating, title:titles(name, type, genres, imdb_rating)').eq('user_id', user_id);
    const userHistory = toHistory(entries);
    let partnerHistory: ReturnType<typeof toHistory> | null = null;
    if (partner_id) {
      const { data } = await supabase.from('watch_entries').select('status, watched_rating, title:titles(name, type, genres, imdb_rating)').eq('user_id', partner_id);
      partnerHistory = toHistory(data);
    }

    const excludeNote = hasExclusions ? `\n\nIMPORTANT: Do NOT recommend any of these titles (already seen/skipped): ${exclude_titles.join(', ')}` : '';
    let filterNote = '';
    if (mood && moodDescriptions[mood]) filterNote += `\nMood preference: ${moodDescriptions[mood]}`;
    if (type_filter) filterNote += `\nType preference: ${type_filter === 'movie' ? 'movies only' : 'TV series only'}`;
    if (time_filter && timeDescriptions[time_filter]) filterNote += `\nDuration preference: ${timeDescriptions[time_filter]}`;

    const prompt = partner_id
      ? `User 1 watch history: ${JSON.stringify(userHistory)}
User 2 watch history: ${JSON.stringify(partnerHistory)}

Generate 5 personal recommendations for User 1 AND 5 shared recommendations both would enjoy. For shared, explain why both would like it. Don't recommend titles they've already watched.${filterNote}${excludeNote}`
      : `User watch history: ${JSON.stringify(userHistory)}

Generate 8 personalized movie/series recommendations based on their preferences and watched history. Don't recommend titles they've already watched. Set shared to null.${filterNote}${excludeNote}`;

    const result = await callTool<Result>({
      model: MODELS.smart,
      system: 'You are a movie recommendation engine. Recommend real movies and TV series with accurate data. Always use the recommend tool.',
      user: prompt,
      tool: {
        name: 'recommend',
        description: 'Return recommendations',
        input_schema: {
          type: 'object',
          properties: {
            personal: { type: 'array', items: recItem },
            shared: { type: ['array', 'null'], items: recItem },
          },
          required: ['personal', 'shared'],
          additionalProperties: false,
        },
      },
    });

    const withPosters = (items: Rec[]) => Promise.all(items.map(async (item) => ({ ...item, image_url: await fetchPosterUrl(item.title, item.type, item.year) })));
    if (result.personal) result.personal = await withPosters(result.personal);
    if (result.shared) result.shared = await withPosters(result.shared);
    else delete (result as Partial<Result>).shared;

    await supabase.from('ai_cache').upsert({ cache_key: cacheKey, response_data: result, expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }, { onConflict: 'cache_key' });
    return json(result);
  } catch (e) {
    console.error('get-recommendations error:', e);
    return claudeErrorResponse(e, { ...corsHeaders, 'Content-Type': 'application/json' }) ?? json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});
