/**
 * Deterministic half of the recommendation engine.
 *
 * The model scores each candidate on interpretable axes; everything that turns those
 * scores into a slate lives here, in code we can read, test and tune. Keep this file
 * free of Deno and network imports — the app's test suite imports it directly.
 */

/** What the model judges per candidate. Each axis is 0-100. */
export type Axes = {
  /** Register, pace and texture against what this viewer actually finishes. */
  tone: number;
  /** Subject matter and preoccupations against their history. */
  theme: number;
  /** Execution quality, independent of fit. */
  craft: number;
  /** Distance from what they have already seen — high means unfamiliar. */
  novelty: number;
  /** Cost of starting: a 10-hour season asks more than a 100-minute film. Higher is easier. */
  effort: number;
};

export type Candidate = {
  id?: string;
  name: string;
  year?: number | null;
  type?: string;
  genres: string[];
  axes: Axes;
  /** Providers this viewer can actually watch it on right now. */
  providers?: string[];
  explanation?: string;
};

export type Weights = Axes;

/** Tone and theme carry the slate; craft breaks ties; novelty and effort trim the edges. */
export const DEFAULT_WEIGHTS: Weights = { tone: 0.3, theme: 0.25, craft: 0.2, novelty: 0.15, effort: 0.1 };

const AXES: (keyof Axes)[] = ['tone', 'theme', 'craft', 'novelty', 'effort'];

const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));

/** Weighted sum of the axes, normalised to 0-100 so weights need not sum to 1. */
export const combineScore = (axes: Axes, weights: Weights = DEFAULT_WEIGHTS): number => {
  const total = AXES.reduce((sum, a) => sum + weights[a], 0);
  if (total === 0) return 0;
  return clamp(AXES.reduce((sum, a) => sum + clamp(axes[a]) * weights[a], 0) / total);
};

/**
 * A weighted distribution over whatever tags are handed in, normalised to sum to 1.
 *
 * Weighting is the point: a 5-star watch says more about taste than an unrated one, and a
 * dropped title is evidence against rather than for. A title's weight is split across its
 * tags so a six-genre film does not count six times.
 */
export const tagMix = (
  entries: { tags: string[]; status?: string; rating?: number | null }[],
): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    const weight = entry.status === 'dropped' ? 0.2 : (entry.rating ?? 3) / 3;
    const share = entry.tags.length ? weight / entry.tags.length : 0;
    for (const tag of entry.tags) counts[tag] = (counts[tag] ?? 0) + share;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (!total) return {};
  return Object.fromEntries(Object.entries(counts).map(([t, c]) => [t, c / total]));
};

/** The same distribution over genres, which is how the calibration layer reads taste. */
export const genreMix = (
  entries: { genres: string[]; status?: string; rating?: number | null }[],
): Record<string, number> => tagMix(entries.map((e) => ({ ...e, tags: e.genres })));

/** KL divergence of the slate's genre mix from the viewer's, smoothed so zeroes are finite. */
export const calibrationError = (
  target: Record<string, number>,
  slate: Record<string, number>,
  smoothing = 0.01,
): number => {
  let kl = 0;
  for (const [genre, p] of Object.entries(target)) {
    if (p <= 0) continue;
    const q = (1 - smoothing) * (slate[genre] ?? 0) + smoothing * p;
    kl += p * Math.log(p / q);
  }
  return kl;
};

/**
 * Steck-style calibrated selection (RecSys 2018): greedily pick the candidate that best
 * trades raw score against keeping the slate's genre mix close to the viewer's own.
 * Without this, argmax hands a 80%-thriller viewer a 100%-thriller slate forever.
 *
 * `lambda` is how much calibration matters: 0 is pure score, 1 is pure mix-matching.
 */
export const calibratedSelect = (
  candidates: Candidate[],
  target: Record<string, number>,
  k: number,
  { lambda = 0.3, weights = DEFAULT_WEIGHTS }: { lambda?: number; weights?: Weights } = {},
): Candidate[] => {
  const pool = [...candidates];
  const chosen: Candidate[] = [];
  while (chosen.length < k && pool.length) {
    let best = 0;
    let bestValue = -Infinity;
    for (let i = 0; i < pool.length; i += 1) {
      const slate = genreMix([...chosen, pool[i]].map((c) => ({ genres: c.genres })));
      const score = combineScore(pool[i].axes, weights) / 100;
      const value = (1 - lambda) * score - lambda * calibrationError(target, slate);
      if (value > bestValue) {
        bestValue = value;
        best = i;
      }
    }
    chosen.push(pool.splice(best, 1)[0]);
  }
  return chosen;
};

/** Jaccard distance on genres — cheap stand-in for item similarity while the catalogue is small. */
const distance = (a: Candidate, b: Candidate): number => {
  const left = new Set(a.genres);
  const right = new Set(b.genres);
  const shared = [...left].filter((g) => right.has(g)).length;
  const union = new Set([...left, ...right]).size;
  return union ? 1 - shared / union : 1;
};

/**
 * Maximal marginal relevance: keeps a slate from being three versions of the same thing.
 * Use after calibration when the slate is small enough that near-duplicates are obvious.
 */
export const diversify = (
  candidates: Candidate[],
  k: number,
  { lambda = 0.7, weights = DEFAULT_WEIGHTS }: { lambda?: number; weights?: Weights } = {},
): Candidate[] => {
  const pool = [...candidates];
  const chosen: Candidate[] = [];
  while (chosen.length < k && pool.length) {
    let best = 0;
    let bestValue = -Infinity;
    for (let i = 0; i < pool.length; i += 1) {
      const relevance = combineScore(pool[i].axes, weights) / 100;
      const novelty = chosen.length ? Math.min(...chosen.map((c) => distance(pool[i], c))) : 1;
      const value = lambda * relevance + (1 - lambda) * novelty;
      if (value > bestValue) {
        bestValue = value;
        best = i;
      }
    }
    chosen.push(pool.splice(best, 1)[0]);
  }
  return chosen;
};

/**
 * Drop what they can't watch tonight. `subscriptions` is the viewer's services; anything
 * available there survives, as does anything free. Rentals survive only if `allowPaid`.
 */
export const watchableNow = (
  candidates: Candidate[],
  subscriptions: string[],
  { allowPaid = false }: { allowPaid?: boolean } = {},
): Candidate[] => {
  if (!subscriptions.length && allowPaid) return candidates;
  const owned = new Set(subscriptions.map((s) => s.toLowerCase()));
  return candidates.filter((c) => {
    if (!c.providers?.length) return allowPaid;
    return c.providers.some((p) => owned.has(p.toLowerCase())) || allowPaid;
  });
};

/**
 * The full slate: calibrate the mix, then break up near-duplicates, then hand back one
 * deliberate wildcard — the highest-novelty candidate that didn't otherwise make it.
 * Exploration is a slot, not an accident.
 */
export const buildSlate = (
  candidates: Candidate[],
  viewerHistory: { genres: string[]; status?: string; rating?: number | null }[],
  { size = 3, weights = DEFAULT_WEIGHTS, lambda = 0.3 }: { size?: number; weights?: Weights; lambda?: number } = {},
): { picks: Candidate[]; wildcard: Candidate | null } => {
  if (!candidates.length) return { picks: [], wildcard: null };
  const target = genreMix(viewerHistory);
  const calibrated = calibratedSelect(candidates, target, Math.min(size * 2, candidates.length), { lambda, weights });
  const picks = diversify(calibrated, size, { weights });
  const chosen = new Set(picks.map((p) => p.name));
  const wildcard = candidates
    .filter((c) => !chosen.has(c.name))
    .sort((a, b) => b.axes.novelty - a.axes.novelty)[0] ?? null;
  return { picks, wildcard };
};

/** What we know about a viewer's taste, as three distributions over the same evidence. */
export type ViewerProfile = {
  genres: Record<string, number>;
  tones?: Record<string, number>;
  themes?: Record<string, number>;
};

/**
 * How far inside a viewer's taste a set of tags sits, as 0-100.
 *
 * The multiplier converts a share into a score: a title carrying two or three of the tags
 * a viewer returns to most should read as a strong fit without every tag having to match.
 * It is a tuning constant, not a measurement.
 */
const fitFrom = (tags: string[], mix: Record<string, number>, multiplier: number): number | null => {
  if (!tags.length || !Object.keys(mix).length) return null;
  return clamp(Math.round(tags.reduce((sum, tag) => sum + (mix[tag] ?? 0), 0) * multiplier));
};

/**
 * Axes derived from saved data alone, with no model involved.
 *
 * The scored slate is the good one, but generating it costs a large model call, so it is
 * produced on a schedule rather than while someone waits. This is what the app serves in
 * the meantime: quality from the rating we hold, effort from runtime and season count, and
 * fit from the tone and theme tags the catalogue carries. Genre stands in for either of
 * those where a title is not tagged yet, which is the old behaviour and a worse one —
 * genre cannot separate a bleak procedural from a warm comedy once both are "Drama".
 */
export const heuristicAxes = (
  row: {
    genres?: string[] | null;
    tones?: string[] | null;
    themes?: string[] | null;
    imdb_rating?: number | null;
    runtime_minutes?: number | null;
    seasons?: number | null;
    type?: string | null;
  },
  viewer: ViewerProfile | Record<string, number>,
): Axes => {
  // Callers held a bare genre distribution before tone and theme were data; both still work.
  const profile: ViewerProfile = 'genres' in viewer && typeof viewer.genres === 'object'
    ? (viewer as ViewerProfile)
    : { genres: viewer as Record<string, number> };

  // Share of the viewer's taste this title sits inside: 1 means every genre they watch.
  const genreFit = fitFrom(row.genres ?? [], profile.genres, 180) ?? 0;
  const toneFit = fitFrom(row.tones ?? [], profile.tones ?? {}, 200) ?? genreFit;
  const themeFit = fitFrom(row.themes ?? [], profile.themes ?? {}, 230) ?? genreFit;

  // No rating held is not evidence of a bad title, so it sits mid-scale rather than at zero.
  const craft = row.imdb_rating ? clamp(Math.round((row.imdb_rating / 10) * 100)) : 55;

  // Effort is how much the title asks before it pays off: one film is easy, six seasons is not.
  const episodes = (row.seasons ?? (row.type === 'series' ? 1 : 0)) * 8;
  const minutes = (row.runtime_minutes ?? (row.type === 'series' ? 50 : 110)) * Math.max(1, episodes || 1);
  const effort = clamp(Math.round(100 - Math.min(100, (minutes / 1800) * 100)));

  return {
    tone: toneFit,
    theme: themeFit,
    craft,
    // Unfamiliar subject matter, not unfamiliar genre: the question is whether they have
    // been here before, and theme answers it more precisely than genre does.
    novelty: clamp(100 - themeFit),
    effort,
  };
};
