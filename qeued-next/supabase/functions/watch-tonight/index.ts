import { corsHeaders, json } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/db.ts';
import { MODELS, callTool, claudeErrorResponse } from '../_shared/claude.ts';
import { type Axes, type Candidate, combineScore, diversify, watchableNow } from '../_shared/ranking.ts';

/**
 * Tonight: what to actually put on, now.
 *
 * The queue comes first. Someone who has chosen eight things and watched none of them
 * does not need a ninth suggestion — they need help picking. So the shortlist is drawn
 * from their own want-to-watch list, filtered to what they can stream tonight, with a
 * single outside wildcard for when nothing in the queue fits the mood.
 */

type Pick = {
  title: string; type: 'movie' | 'series'; year: number; genres: string[];
  imdb_rating: number; explanation: string; pick_type: 'best' | 'safe' | 'wildcard';
  in_queue: boolean; providers: { provider: string; offer_type: string; url?: string | null }[];
  runtime_minutes?: number | null; image_url?: string | null; title_id?: string | null;
};

const axisSchema = {
  type: 'object',
  description: 'Each axis is 0-100.',
  properties: {
    tone: { type: 'integer', description: 'Fit with the mood they asked for.' },
    theme: { type: 'integer', description: 'Fit with what they usually watch.' },
    craft: { type: 'integer', description: 'Execution quality, judged independently of fit.' },
    novelty: { type: 'integer', description: 'Distance from what they have already seen.' },
    effort: { type: 'integer', description: 'How easy it is to start tonight. Higher is easier.' },
  },
  required: ['tone', 'theme', 'craft', 'novelty', 'effort'],
  additionalProperties: false,
} as const;

const moodDescriptions: Record<string, string> = {
  easy: 'light, relaxing, feel-good',
  intense: 'gripping, dark, thrilling, suspenseful',
  funny: 'comedy, humor, laughs',
  smart: 'thought-provoking, clever, intellectual',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { user_id, profile_id, mood, type, time, subscriptions } = await req.json();
    if (!user_id) return json({ error: 'user_id required' }, 400);

    const supabase = serviceClient();
    const cacheKey = `tonight2:${profile_id ?? user_id}:${mood ?? 'any'}:${type ?? 'any'}:${time ?? 'any'}`;
    const { data: cached } = await supabase.from('ai_cache').select('response_data, expires_at').eq('cache_key', cacheKey).single();
    if (cached && new Date(cached.expires_at) > new Date()) return json(cached.response_data);

    const { data: entries } = await supabase
      .from('watch_entries')
      .select('status, watched_rating, title:titles(id, name, year, type, genres, imdb_rating, runtime_minutes, seasons, synopsis, image_url, title_availability(provider, offer_type, url))')
      .eq(profile_id ? 'profile_id' : 'user_id', profile_id ?? user_id);

    // deno-lint-ignore no-explicit-any
    const rows = (entries ?? []) as any[];
    const queue = rows.filter((e) => e.status === 'want_to_watch' || e.status === 'watching');
    const seen = rows.filter((e) => e.status === 'watched' || e.status === 'dropped');
    const history = seen.map((e) => ({ title: e.title?.name, rating: e.watched_rating, genres: e.title?.genres ?? [] }));

    const queueForModel = queue.map((e) => ({
      title: e.title?.name,
      year: e.title?.year,
      type: e.title?.type,
      genres: e.title?.genres ?? [],
      runtime_minutes: e.title?.runtime_minutes,
      seasons: e.title?.seasons,
      status: e.status,
      available_on: [...new Set((e.title?.title_availability ?? []).map((a: { provider: string }) => a.provider))],
    }));

    const timeNote = time === 'short'
      ? 'They have a short evening: favour a film under two hours or a single episode.'
      : time === 'long'
      ? 'They have time: a long film or the start of a series is fine.'
      : '';

    const scored = await callTool<{ queue_scores: ({ title: string; explanation: string; axes: Axes })[]; wildcard: { title: string; type: 'movie' | 'series'; year: number; genres: string[]; imdb_rating: number; explanation: string; axes: Axes } | null }>({
      model: MODELS.smart,
      system:
        'You help someone choose what to watch tonight from a list they have already chosen. ' +
        'Score every item on their list honestly — the point is to separate them, so spread the axes. ' +
        'Always use the tonight tool.',
      user:
        `Their queue (already chosen, not yet watched):\n${JSON.stringify(queueForModel)}\n\n` +
        `What they have watched before: ${JSON.stringify(history)}\n\n` +
        `Mood wanted: ${moodDescriptions[mood] ?? mood ?? 'no preference'}\n` +
        `${type ? `They want a ${type === 'series' ? 'series' : 'film'}.\n` : ''}${timeNote}\n\n` +
        `Score every queue item against tonight. Then propose exactly one wildcard that is NOT on their queue ` +
        `and not in their history — something worth abandoning the queue for tonight. If the queue is empty, ` +
        `still return the wildcard.`,
      tool: {
        name: 'tonight',
        description: 'Score the queue for tonight and propose one outside wildcard',
        input_schema: {
          type: 'object',
          properties: {
            queue_scores: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  explanation: { type: 'string', description: 'One sentence on why it does or does not suit tonight.' },
                  axes: axisSchema,
                },
                required: ['title', 'explanation', 'axes'],
                additionalProperties: false,
              },
            },
            wildcard: {
              type: ['object', 'null'],
              properties: {
                title: { type: 'string' },
                type: { type: 'string', enum: ['movie', 'series'] },
                year: { type: 'integer' },
                genres: { type: 'array', items: { type: 'string' } },
                imdb_rating: { type: 'number' },
                explanation: { type: 'string' },
                axes: axisSchema,
              },
              required: ['title', 'type', 'year', 'genres', 'imdb_rating', 'explanation', 'axes'],
              additionalProperties: false,
            },
          },
          required: ['queue_scores', 'wildcard'],
          additionalProperties: false,
        },
      },
    });

    const byTitle = new Map(queue.map((e) => [e.title?.name, e]));
    const scoredQueue: Candidate[] = (scored.queue_scores ?? [])
      .filter((s) => byTitle.has(s.title))
      .map((s) => {
        const entry = byTitle.get(s.title);
        return {
          id: entry.title?.id,
          name: s.title,
          year: entry.title?.year,
          type: entry.title?.type,
          genres: entry.title?.genres ?? [],
          axes: s.axes,
          explanation: s.explanation,
          providers: [...new Set((entry.title?.title_availability ?? []).map((a: { provider: string }) => a.provider))] as string[],
        };
      });

    // Only shortlist what they can actually put on. If that empties the list, fall back to
    // the whole queue rather than returning nothing — a rental they must pay for still beats
    // an empty screen.
    const subs: string[] = Array.isArray(subscriptions) ? subscriptions : [];
    const watchable = subs.length ? watchableNow(scoredQueue, subs) : scoredQueue;
    const shortlist = diversify(watchable.length ? watchable : scoredQueue, 2);

    const asPick = (c: Candidate, pickType: Pick['pick_type']): Pick => {
      const entry = byTitle.get(c.name);
      return {
        title: c.name,
        type: (c.type ?? 'movie') as 'movie' | 'series',
        year: c.year ?? 0,
        genres: c.genres,
        imdb_rating: entry?.title?.imdb_rating ?? 0,
        explanation: c.explanation ?? '',
        pick_type: pickType,
        in_queue: true,
        title_id: entry?.title?.id ?? null,
        runtime_minutes: entry?.title?.runtime_minutes ?? null,
        image_url: entry?.title?.image_url ?? null,
        providers: (entry?.title?.title_availability ?? []).map((a: { provider: string; offer_type: string; url?: string }) => ({
          provider: a.provider, offer_type: a.offer_type, url: a.url ?? null,
        })),
      };
    };

    const picks: Pick[] = shortlist.map((c, i) => asPick(c, i === 0 ? 'best' : 'safe'));
    if (scored.wildcard) {
      picks.push({
        title: scored.wildcard.title,
        type: scored.wildcard.type,
        year: scored.wildcard.year,
        genres: scored.wildcard.genres,
        imdb_rating: scored.wildcard.imdb_rating,
        explanation: scored.wildcard.explanation,
        pick_type: 'wildcard',
        in_queue: false,
        providers: [],
      });
    }

    const result = {
      picks,
      queue_size: queue.length,
      // Everything the model saw, so the UI can show the rest of the queue ranked.
      ranked_queue: scoredQueue
        .map((c) => ({ title: c.name, title_id: c.id, score: Math.round(combineScore(c.axes)), explanation: c.explanation }))
        .sort((a, b) => b.score - a.score),
    };

    await supabase.from('ai_cache').upsert(
      { cache_key: cacheKey, response_data: result, expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() },
      { onConflict: 'cache_key' },
    );
    return json(result);
  } catch (e) {
    console.error('watch-tonight error:', e);
    return claudeErrorResponse(e, { ...corsHeaders, 'Content-Type': 'application/json' }) ?? json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});
