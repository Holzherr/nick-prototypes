import { type Candidate, type ViewerProfile, combineScore, diversify, genreMix, heuristicAxes, tagMix } from '../../../supabase/functions/_shared/ranking';
import type { TonightPick, TonightResult } from './TonightScreen';

/**
 * Tonight, ranked from saved data alone: the shape `watch-tonight` returns, built on the client
 * from the rows the profile already holds, so nobody waits on the model to see a slate. Every
 * explanation is data — provider, runtime, list membership — never a sentence the model wrote.
 */
export type TonightEntry = {
  status: string; watched_rating: number | null; current_season: number | null; current_episode: number | null;
  title: {
    id: string; name: string; year: number | null; type: string | null; genres: string[] | null; tones: string[] | null; themes: string[] | null;
    imdb_rating: number | null; runtime_minutes: number | null; seasons: number | null; image_url: string | null;
    title_availability: { provider: string; offer_type: string; url: string | null }[] | null;
  } | null;
};

export const TONIGHT_SELECT =
  'status, watched_rating, current_season, current_episode, title:titles(id, name, year, type, genres, tones, themes, imdb_rating, runtime_minutes, seasons, image_url, title_availability(provider, offer_type, url))';

/** The four moods the edge function describes to the model, as the tone and genre tags they name. */
const moodTags: Record<string, string[]> = {
  intense: ['tense', 'bleak', 'unsettling', 'Thriller', 'Crime', 'Horror', 'Mystery'],
  easy: ['warm', 'uplifting', 'playful', 'romantic', 'Comedy', 'Romance', 'Family', 'Animation'],
  funny: ['funny', 'playful', 'absurd', 'Comedy'],
  smart: ['earnest', 'cool', 'melancholy', 'Documentary', 'Sci-Fi', 'Biography', 'History'],
};

/** Episodes are stored as the last one watched, so the next is always one further on. */
const nextEpisode = (e: TonightEntry): string | null => {
  if (!e.current_season && !e.current_episode) return null;
  if (e.current_season && !e.current_episode) return `S${e.current_season} E1`;
  return `S${e.current_season ?? 1} E${(e.current_episode ?? 0) + 1}`;
};

/** One line, from data only: `On Netflix · 98 min · from your list`. Never empty. */
const explain = (e: TonightEntry): string => {
  const t = e.title!;
  const providers = [...new Set((t.title_availability ?? []).map((a) => a.provider))];
  const started = nextEpisode(e);
  const parts = [
    providers.length ? `On ${providers.slice(0, 2).join(' or ')}` : null,
    t.type === 'series'
      ? started ? `${started} next` : t.seasons ? `${t.seasons} season${t.seasons === 1 ? '' : 's'}` : null
      : t.runtime_minutes ? `${t.runtime_minutes} min` : null,
    e.status === 'watching' ? "you're watching" : 'from your list',
  ];
  return parts.filter(Boolean).join(' · ');
};

const shortFriendly = (e: TonightEntry): boolean =>
  e.title!.type === 'series' ? nextEpisode(e) !== null : (e.title!.runtime_minutes ?? 999) < 120;

export const rankTonight = (entries: TonightEntry[], mood: string, length: string): TonightResult => {
  const rows = entries.filter((e) => e.title);
  const queue = rows.filter((e) => e.status === 'want_to_watch' || e.status === 'watching');
  const history = rows.filter((e) => e.status === 'watched' || e.status === 'dropped')
    .map((e) => ({ status: e.status, rating: e.watched_rating, title: e.title! }));
  const viewer: ViewerProfile = {
    genres: genreMix(history.map((h) => ({ ...h, genres: h.title.genres ?? [] }))),
    tones: tagMix(history.map((h) => ({ ...h, tags: h.title.tones ?? [] }))),
    themes: tagMix(history.map((h) => ({ ...h, tags: h.title.themes ?? [] }))),
  };
  const wanted = new Set(moodTags[mood] ?? []);
  const byName = new Map(queue.map((e) => [e.title!.name, e]));
  const candidates: Candidate[] = queue.map((e) => {
    const t = e.title!;
    const axes = heuristicAxes(t, viewer);
    // Tone is fit with the mood asked for, as the model is told to score it; mid-series costs nothing.
    axes.tone = [...(t.tones ?? []), ...(t.genres ?? [])].some((tag) => wanted.has(tag)) ? 100 : 30;
    if (nextEpisode(e) || e.status === 'watching') axes.effort = 100;
    return { id: t.id, name: t.name, year: t.year, type: t.type ?? undefined, genres: t.genres ?? [], axes, explanation: explain(e) };
  });

  // A short night drops nothing: films under two hours and series already started come first.
  const friendly = length === 'short' ? candidates.filter((c) => shortFriendly(byName.get(c.name)!)) : candidates;
  const score = (c: Candidate) => Math.round(combineScore(c.axes));
  const rank = (a: Candidate, b: Candidate) => score(b) - score(a);
  const ranked = [...friendly.sort(rank), ...candidates.filter((c) => !friendly.includes(c)).sort(rank)];
  const chosen = diversify(friendly.length ? friendly : candidates, 2);
  if (chosen.length < 2) chosen.push(...diversify(candidates.filter((c) => !chosen.includes(c)), 2 - chosen.length));

  const pick = (c: Candidate, i: number): TonightPick => {
    const t = byName.get(c.name)!.title!;
    return {
      title: t.name, type: t.type === 'series' ? 'series' : 'movie', year: t.year ?? 0, genres: t.genres ?? [],
      imdb_rating: t.imdb_rating ?? 0, explanation: c.explanation!, pick_type: i === 0 ? 'best' : 'safe', in_queue: true,
      providers: (t.title_availability ?? []).map((a) => ({ provider: a.provider, offer_type: a.offer_type, url: a.url })),
      runtime_minutes: t.runtime_minutes, image_url: t.image_url, title_id: t.id,
    };
  };
  return {
    picks: chosen.map(pick),
    queue_size: queue.length,
    ranked_queue: ranked.map((c) => ({ title: c.name, title_id: c.id, score: score(c), explanation: c.explanation! })),
    scored: false,
  };
};
