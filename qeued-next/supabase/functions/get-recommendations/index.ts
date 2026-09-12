import { corsHeaders, json } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/db.ts';
import { MODELS, callTool, claudeErrorResponse } from '../_shared/claude.ts';
import { type Axes, type Candidate, buildSlate, combineScore, genreMix, heuristicAxes } from '../_shared/ranking.ts';

/**
 * Recommends out of Qeued's own catalogue, and returns real rows.
 *
 * Two things this deliberately does not do. It does not ask the model to name titles — it
 * hands over the catalogue and asks for scores, so every recommendation is a row that
 * already has a poster, a synopsis and cited facts. And it fetches nothing at request
 * time: posters and metadata come from the record rather than a lookup.
 *
 * The payoff is in the client. A recommendation carries its title_id, so opening one is a
 * navigation rather than a round trip — the previous flow had to call the search function,
 * and with it the model, on every single click just to work out which title was tapped.
 */

type Rec = {
  title_id: string;
  slug: string | null;
  title: string;
  type: 'movie' | 'series';
  year: number;
  genres: string[];
  imdb_rating: number;
  match_score: number;
  explanation: string;
  image_url: string | null;
  certification: string | null;
  runtime_minutes: number | null;
  providers: string[];
};
type Result = {
  personal: Rec[];
  shared: Rec[] | null;
  /** False when the slate was ranked from saved data alone, with no model involved. */
  scored?: boolean;
};

/** How much of the catalogue to put in front of the model in one pass. */
const CANDIDATE_LIMIT = 120;
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

/** Candidates are scored by index: it keeps the response small and the ids exact. */
const scoreSchema = {
  type: 'object',
  properties: {
    ref: { type: 'integer', description: 'The candidate number given in the list.' },
    explanation: { type: 'string', description: 'One sentence, addressed to the viewer, on why this fits them.' },
    axes: axisSchema,
  },
  required: ['ref', 'explanation', 'axes'],
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
type Row = any;

const toHistory = (rows: Row[] | null) =>
  (rows || []).map((e) => ({
    title: e.title?.name,
    status: e.status,
    rating: e.watched_rating,
    genres: e.title?.genres ?? [],
  }));

const providersOf = (row: Row): string[] =>
  [...new Set((row.title_availability ?? []).map((a: { provider: string }) => a.provider))] as string[];

/**
 * Turns scored candidates into the response. Shared by both paths, because a heuristic
 * slate and a model-scored one differ only in where the axes came from — the calibration,
 * de-duplication and wildcard slot are the same either way.
 */
const slateFrom = (
  pool: Candidate[],
  candidates: Row[],
  history: { genres: string[]; status?: string; rating?: number | null }[],
  partnerHistory: { genres: string[]; status?: string; rating?: number | null }[] | null,
): Result => {
  const rowById = new Map(candidates.map((t: Row) => [t.id, t]));

  const toRec = (c: Candidate): Rec => {
    const row = rowById.get(c.id!);
    return {
      title_id: c.id!,
      slug: row?.slug ?? null,
      title: c.name,
      type: (c.type ?? 'movie') as 'movie' | 'series',
      year: c.year ?? 0,
      genres: c.genres,
      imdb_rating: row?.imdb_rating ?? 0,
      match_score: Math.round(combineScore(c.axes)),
      explanation: c.explanation ?? '',
      image_url: row?.image_url ?? null,
      certification: row?.certification ?? null,
      runtime_minutes: row?.runtime_minutes ?? null,
      providers: c.providers ?? [],
    };
  };

  // The wildcard rides along as the last pick: exploration is a slot, not an accident.
  const slate = (size: number, viewerHistory: typeof history) => {
    if (!pool.length) return [];
    const { picks, wildcard } = buildSlate(pool, viewerHistory, { size: size - 1 });
    return [...picks, ...(wildcard ? [wildcard] : [])].map(toRec);
  };

  const result: Result = {
    personal: slate(PERSONAL_SLATE, history),
    shared: partnerHistory ? slate(SHARED_SLATE, [...history, ...partnerHistory]) : null,
  };
  if (!result.shared) delete result.shared;
  return result;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { user_id, profile_id, partner_id, exclude_titles, mood, type_filter, time_filter, mode } = await req.json();
    if (!user_id) return json({ error: 'user_id required' }, 400);

    const supabase = serviceClient();
    const hasExclusions = Array.isArray(exclude_titles) && exclude_titles.length > 0;
    const filterSuffix = [mood, type_filter, time_filter].filter(Boolean).join(':');
    const who = profile_id ?? user_id;
    const cacheKey = partner_id
      ? `recs3:${[who, partner_id].sort().join(':')}${filterSuffix ? `:${filterSuffix}` : ''}`
      : `recs3:${who}${filterSuffix ? `:${filterSuffix}` : ''}`;
    if (!hasExclusions) {
      const { data: cached } = await supabase.from('ai_cache').select('response_data, expires_at').eq('cache_key', cacheKey).single();
      if (cached && new Date(cached.expires_at) > new Date()) return json(cached.response_data);
    }

    const entryColumns = 'status, watched_rating, title_id, title:titles(name, genres)';
    const { data: entries } = await supabase
      .from('watch_entries')
      .select(entryColumns)
      .eq(profile_id ? 'profile_id' : 'user_id', who);
    const history = toHistory(entries);
    const ownTitleIds = new Set((entries ?? []).map((e: Row) => e.title_id));

    let partnerHistory: ReturnType<typeof toHistory> | null = null;
    if (partner_id) {
      const { data } = await supabase.from('watch_entries').select(entryColumns).eq('profile_id', partner_id);
      partnerHistory = toHistory(data);
    }

    // Only catalogued rows are candidates. Unverified import residue is real enough to
    // match a name and not real enough to recommend.
    const { data: catalogue } = await supabase
      .from('titles')
      .select('id, slug, name, year, type, genres, synopsis, certification, runtime_minutes, seasons, imdb_rating, image_url, title_availability(provider)')
      .gt('catalogue_version', 0)
      .limit(400);

    const excluded = new Set((hasExclusions ? exclude_titles : []).map((t: string) => String(t).toLowerCase()));
    const candidates = (catalogue ?? [])
      .filter((t: Row) => !ownTitleIds.has(t.id) && !excluded.has(String(t.name).toLowerCase()))
      .filter((t: Row) => (type_filter ? t.type === type_filter : true))
      .slice(0, CANDIDATE_LIMIT);

    if (!candidates.length) {
      return json({ personal: [], shared: null, note: 'Nothing left in the catalogue for this profile.' });
    }

    let notes = '';
    if (mood && moodDescriptions[mood]) notes += `\nMood wanted: ${moodDescriptions[mood]}`;
    if (time_filter && timeDescriptions[time_filter]) notes += `\nLength wanted: ${timeDescriptions[time_filter]}`;

    const list = candidates
      .map((t: Row, i: number) =>
        `${i}. ${t.name} (${t.year ?? '?'}) — ${t.type}, ${(t.genres ?? []).join('/')}` +
        `${t.certification ? `, ${t.certification}` : ''}${t.runtime_minutes ? `, ${t.runtime_minutes} min` : ''}` +
        `${t.seasons ? `, ${t.seasons} season(s)` : ''}${t.synopsis ? `\n   ${t.synopsis}` : ''}`,
      )
      .join('\n');

    const audience = partnerHistory
      ? `Viewer A has watched: ${JSON.stringify(history)}\nViewer B has watched: ${JSON.stringify(partnerHistory)}`
      : `They have watched: ${JSON.stringify(history)}`;

    const viewerMix = genreMix(history.map((h) => ({ genres: h.genres, status: h.status, rating: h.rating })));

    if (mode !== 'refresh') {
      // Nothing cached and no permission to spend a minute of the user's time: rank what we
      // hold. The scheduled refresh replaces this with model scores.
      const pool: Candidate[] = candidates.map((row: Row) => ({
        id: row.id,
        name: row.name,
        year: row.year,
        type: row.type,
        genres: row.genres ?? [],
        axes: heuristicAxes(row, viewerMix),
        explanation: '',
        providers: providersOf(row),
      }));
      const result = slateFrom(pool, candidates, history, partnerHistory);
      result.scored = false;
      return json(result);
    }

    const scored = await callTool<{ scores: { ref: number; explanation: string; axes: Axes }[] }>({
      model: MODELS.smart,
      system:
        'You score candidates for a personal watchlist app. You do not choose the final list — a ranking layer ' +
        'does that from your scores, so score honestly and spread the axes out. A candidate that is excellent but ' +
        'a poor fit for this viewer should score high craft and low tone. Always use the score tool.',
      user:
        `${audience}\n\n` +
        `Score every candidate below for this viewer. Use the candidate's number as "ref".${notes}\n\n` +
        `Candidates:\n${list}`,
      tool: {
        name: 'score',
        description: 'Score each candidate by its number',
        input_schema: {
          type: 'object',
          properties: { scores: { type: 'array', items: scoreSchema } },
          required: ['scores'],
          additionalProperties: false,
        },
      },
      maxTokens: 16384,
    });

    const byRef = new Map<number, { explanation: string; axes: Axes }>();
    for (const score of scored.scores ?? []) {
      if (candidates[score.ref]) byRef.set(score.ref, { explanation: score.explanation, axes: score.axes });
    }

    const pool: Candidate[] = [...byRef.entries()].map(([ref, score]) => {
      const row = candidates[ref];
      return {
        id: row.id,
        name: row.name,
        year: row.year,
        type: row.type,
        genres: row.genres ?? [],
        axes: score.axes,
        explanation: score.explanation,
        providers: providersOf(row),
      };
    });

    const result = slateFrom(pool, candidates, history, partnerHistory);
    result.scored = true;

    // Genre mix of what shipped, so drift away from the viewer's own mix shows up in logs.
    console.log('slate mix', JSON.stringify(genreMix(result.personal.map((r) => ({ genres: r.genres })))));

    await supabase.from('ai_cache').upsert(
      { cache_key: cacheKey, response_data: result, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
      { onConflict: 'cache_key' },
    );
    return json(result);
  } catch (e) {
    console.error('get-recommendations error:', e);
    return claudeErrorResponse(e, { ...corsHeaders, 'Content-Type': 'application/json' }) ?? json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});
