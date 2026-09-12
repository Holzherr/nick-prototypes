import { corsHeaders, json } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/db.ts';
import { MODELS, callTool, claudeErrorResponse } from '../_shared/claude.ts';
import { fetchPosterUrl } from '../_shared/posters.ts';
import { type Axes, type Candidate, buildSlate, combineScore, genreMix } from '../_shared/ranking.ts';

/**
 * The model proposes and scores a pool; this function selects the slate.
 *
 * Asking a model for "8 recommendations" gives an unrepeatable answer nobody can tune.
 * Instead it scores a wide pool on interpretable axes, and _shared/ranking.ts decides
 * what ships — calibrated to the viewer's real genre mix and de-duplicated. The score
 * the UI shows is then something we computed, and can explain.
 */

type Rec = {
  title: string; type: 'movie' | 'series'; year: number; genres: string[];
  imdb_rating: number; match_score: number; explanation: string; image_url?: string | null;
};
type Result = { personal: Rec[]; shared: Rec[] | null };

type Scored = {
  title: string; type: 'movie' | 'series'; year: number; genres: string[];
  imdb_rating: number; explanation: string; axes: Axes;
};

const POOL_SIZE = 24;
const PERSONAL_SLATE = 8;
const SHARED_SLATE = 5;

const axisSchema = {
  type: 'object',
  description: 'Each axis is 0-100.',
  properties: {
    tone: { type: 'integer', description: 'Register, pace and texture against what this viewer finishes.' },
    theme: { type: 'integer', description: 'Subject matter against their history.' },
    craft: { type: 'integer', description: 'Execution quality, judged independently of fit.' },
    novelty: { type: 'integer', description: 'Distance from what they have already seen. High means unfamiliar.' },
    effort: { type: 'integer', description: 'How easy it is to start. A film is higher than a ten-hour season.' },
  },
  required: ['tone', 'theme', 'craft', 'novelty', 'effort'],
  additionalProperties: false,
} as const;

const candidateSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    type: { type: 'string', enum: ['movie', 'series'] },
    year: { type: 'integer' },
    genres: { type: 'array', items: { type: 'string' } },
    imdb_rating: { type: 'number' },
    explanation: { type: 'string', description: 'One sentence, addressed to the viewer, on why this fits them.' },
    axes: axisSchema,
  },
  required: ['title', 'type', 'year', 'genres', 'imdb_rating', 'explanation', 'axes'],
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
  (rows || []).map((e) => ({
    title: e.title?.name,
    status: e.status,
    rating: e.watched_rating,
    genres: e.title?.genres ?? [],
    imdb: e.title?.imdb_rating,
  }));

const scorePool = async (
  history: ReturnType<typeof toHistory>,
  partnerHistory: ReturnType<typeof toHistory> | null,
  catalogue: { name: string; year: number | null; type: string; genres: string[] }[],
  notes: string,
  exclude: string[],
): Promise<{ personal: Scored[]; shared: Scored[] | null }> => {
  const excludeNote = exclude.length
    ? `\n\nNever propose these — already seen or skipped: ${exclude.join(', ')}`
    : '';
  const catalogueNote = catalogue.length
    ? `\n\nQeued already holds records for these, so prefer them where they genuinely fit — ` +
      `we can tell the viewer exactly where to watch them: ${catalogue.map((c) => `${c.name} (${c.year ?? '?'})`).join(', ')}`
    : '';

  const audience = partnerHistory
    ? `Viewer A history: ${JSON.stringify(history)}\nViewer B history: ${JSON.stringify(partnerHistory)}`
    : `Viewer history: ${JSON.stringify(history)}`;

  return await callTool<{ personal: Scored[]; shared: Scored[] | null }>({
    model: MODELS.smart,
    system:
      'You propose and score candidates for a personal watchlist app. You do not choose the final list — ' +
      'a ranking layer does that from your scores, so score honestly and spread the axes out. ' +
      'A candidate that is excellent but a poor fit should score high craft and low tone. Real titles with accurate data only. ' +
      'Always use the propose tool.',
    user:
      `${audience}\n\n` +
      `Propose ${POOL_SIZE} candidates this viewer has not seen, scored on every axis. ` +
      `Spread them deliberately: include some safe matches, some that stretch their taste, and some outside their usual genres — ` +
      `the ranking layer needs range to choose from, and a pool of near-identical thrillers gives it nothing to do.` +
      (partnerHistory
        ? ` Also propose ${POOL_SIZE} candidates in "shared" that both viewers would enjoy, scored the same way.`
        : ' Set shared to null.') +
      `${notes}${catalogueNote}${excludeNote}`,
    tool: {
      name: 'propose',
      description: 'Return a scored pool of candidates',
      input_schema: {
        type: 'object',
        properties: {
          personal: { type: 'array', items: candidateSchema },
          shared: { type: ['array', 'null'], items: candidateSchema },
        },
        required: ['personal', 'shared'],
        additionalProperties: false,
      },
    },
  });
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { user_id, partner_id, exclude_titles, mood, type_filter, time_filter } = await req.json();
    if (!user_id) return json({ error: 'user_id required' }, 400);

    const supabase = serviceClient();
    const hasExclusions = Array.isArray(exclude_titles) && exclude_titles.length > 0;
    const filterSuffix = [mood, type_filter, time_filter].filter(Boolean).join(':');
    const cacheKey = partner_id
      ? `recs2:${[user_id, partner_id].sort().join(':')}${filterSuffix ? `:${filterSuffix}` : ''}`
      : `recs2:${user_id}${filterSuffix ? `:${filterSuffix}` : ''}`;
    if (!hasExclusions) {
      const { data: cached } = await supabase.from('ai_cache').select('response_data, expires_at').eq('cache_key', cacheKey).single();
      if (cached && new Date(cached.expires_at) > new Date()) return json(cached.response_data);
    }

    const entryColumns = 'status, watched_rating, title:titles(name, type, genres, imdb_rating)';
    const { data: entries } = await supabase.from('watch_entries').select(entryColumns).eq('user_id', user_id);
    const history = toHistory(entries);
    let partnerHistory: ReturnType<typeof toHistory> | null = null;
    if (partner_id) {
      const { data } = await supabase.from('watch_entries').select(entryColumns).eq('user_id', partner_id);
      partnerHistory = toHistory(data);
    }

    // Titles we hold records for and this viewer has no entry against: we know where to
    // watch these, so they are worth more than a title we would have to describe blind.
    const seen = new Set(history.map((h) => h.title));
    const { data: catalogueRows } = await supabase
      .from('titles')
      .select('id, name, year, type, genres, synopsis, title_availability(provider, offer_type)')
      .gt('catalogue_version', 0)
      .limit(200);
    const catalogue = (catalogueRows ?? []).filter((t) => !seen.has(t.name));
    const providersByName = new Map<string, string[]>(
      catalogue.map((t) => [
        t.name,
        // deno-lint-ignore no-explicit-any
        [...new Set(((t as any).title_availability ?? []).map((a: any) => a.provider))] as string[],
      ]),
    );

    let notes = '';
    if (mood && moodDescriptions[mood]) notes += `\nMood wanted: ${moodDescriptions[mood]}`;
    if (type_filter) notes += `\nType: ${type_filter === 'movie' ? 'films only' : 'series only'}`;
    if (time_filter && timeDescriptions[time_filter]) notes += `\nLength: ${timeDescriptions[time_filter]}`;

    const pool = await scorePool(
      history,
      partnerHistory,
      catalogue.map((t) => ({ name: t.name, year: t.year, type: t.type, genres: t.genres ?? [] })),
      notes,
      hasExclusions ? exclude_titles : [],
    );

    const toCandidate = (s: Scored): Candidate => ({
      name: s.title, year: s.year, type: s.type, genres: s.genres, axes: s.axes,
      providers: providersByName.get(s.title), explanation: s.explanation,
    });
    const toRec = (c: Candidate): Rec => {
      const source = [...(pool.personal ?? []), ...(pool.shared ?? [])].find((s) => s.title === c.name);
      return {
        title: c.name,
        type: (c.type ?? 'movie') as 'movie' | 'series',
        year: c.year ?? 0,
        genres: c.genres,
        imdb_rating: source?.imdb_rating ?? 0,
        match_score: Math.round(combineScore(c.axes)),
        explanation: c.explanation ?? '',
      };
    };

    // The wildcard rides along as the last pick: exploration is a slot, not an accident.
    const slateFor = (scored: Scored[] | null, size: number, viewerHistory: ReturnType<typeof toHistory>) => {
      if (!scored?.length) return [];
      const { picks, wildcard } = buildSlate(
        scored.map(toCandidate),
        viewerHistory.map((h) => ({ genres: h.genres, status: h.status, rating: h.rating })),
        { size: size - 1 },
      );
      return [...picks, ...(wildcard ? [wildcard] : [])].map(toRec);
    };

    const result: Result = {
      personal: slateFor(pool.personal, PERSONAL_SLATE, history),
      shared: partnerHistory ? slateFor(pool.shared, SHARED_SLATE, [...history, ...partnerHistory]) : null,
    };

    const withPosters = (items: Rec[]) =>
      Promise.all(items.map(async (item) => ({ ...item, image_url: await fetchPosterUrl(item.title, item.type, item.year) })));
    result.personal = await withPosters(result.personal);
    if (result.shared) result.shared = await withPosters(result.shared);
    else delete (result as Partial<Result>).shared;

    // Genre mix of what shipped, so a drift away from the viewer's own mix is visible in logs.
    console.log('slate mix', JSON.stringify(genreMix(result.personal.map((r) => ({ genres: r.genres })))));

    await supabase.from('ai_cache').upsert(
      { cache_key: cacheKey, response_data: result, expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
      { onConflict: 'cache_key' },
    );
    return json(result);
  } catch (e) {
    console.error('get-recommendations error:', e);
    return claudeErrorResponse(e, { ...corsHeaders, 'Content-Type': 'application/json' }) ?? json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});
