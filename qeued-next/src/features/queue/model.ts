/** Ordering a queue by comparison, and knowing where someone is in a series. */

export type Duel = { winner_title_id: string; loser_title_id: string };

export type Progress = {
  current_season: number | null;
  current_episode: number | null;
  seasons?: number | null;
  episodes?: number | null;
};

/**
 * Strength per title from pairwise wins, by Bradley-Terry minorisation-maximisation.
 *
 * A 1-to-10 desire dropdown asked for a number nobody has, and went unused across every
 * entry. "This or that" asks a question people can actually answer, and a handful of taps
 * orders a whole list — this is what turns those taps back into an order.
 *
 * Each title starts equal. Every round, a title's strength becomes its win count divided by
 * how much competition it faced, which converges quickly at the sizes a personal queue
 * reaches.
 *
 * Every title also gets half a win and one match against a virtual average opponent. Without
 * it a title that lost every time has no defined strength and lands on the same value as one
 * never compared — so consistent losers would rank level with unknowns. With it, losing
 * costs you and an uncompared title sits between the two, which is what "we don't know yet"
 * should look like.
 */
export const rankFromDuels = (titleIds: string[], duels: Duel[], rounds = 25): Map<string, number> => {
  const strength = new Map(titleIds.map((id) => [id, 1]));
  const relevant = duels.filter((d) => strength.has(d.winner_title_id) && strength.has(d.loser_title_id));
  if (!relevant.length) return strength;

  const PRIOR_WINS = 0.5;
  const wins = new Map(titleIds.map((id) => [id, PRIOR_WINS]));
  for (const duel of relevant) wins.set(duel.winner_title_id, (wins.get(duel.winner_title_id) ?? 0) + 1);

  for (let round = 0; round < rounds; round += 1) {
    const next = new Map(strength);
    for (const id of titleIds) {
      const won = wins.get(id) ?? 0;

      // Total competition faced: each meeting contributes its share of the pair's strength,
      // plus one match against a virtual average opponent to keep the estimate defined.
      let competition = 1 / ((strength.get(id) ?? 1) + 1);
      for (const duel of relevant) {
        const other =
          duel.winner_title_id === id ? duel.loser_title_id
          : duel.loser_title_id === id ? duel.winner_title_id
          : null;
        if (!other) continue;
        const pair = (strength.get(id) ?? 1) + (strength.get(other) ?? 1);
        if (pair > 0) competition += 1 / pair;
      }
      if (competition > 0) next.set(id, won / competition);
    }
    // Normalise so strengths stay comparable between runs rather than drifting upwards.
    const total = [...next.values()].reduce((a, b) => a + b, 0) || 1;
    const scale = titleIds.length / total;
    for (const [id, value] of next) strength.set(id, value * scale);
  }
  return strength;
};

/**
 * The next pair worth asking about: the two least-compared titles that have not met.
 * Asking about a pair whose order is already settled wastes the tap.
 */
export const nextDuel = (titleIds: string[], duels: Duel[]): [string, string] | null => {
  if (titleIds.length < 2) return null;

  const appearances = new Map(titleIds.map((id) => [id, 0]));
  const met = new Set<string>();
  for (const duel of duels) {
    appearances.set(duel.winner_title_id, (appearances.get(duel.winner_title_id) ?? 0) + 1);
    appearances.set(duel.loser_title_id, (appearances.get(duel.loser_title_id) ?? 0) + 1);
    met.add([duel.winner_title_id, duel.loser_title_id].sort().join('|'));
  }

  const byNeed = [...titleIds].sort((a, b) => (appearances.get(a) ?? 0) - (appearances.get(b) ?? 0));
  for (let i = 0; i < byNeed.length; i += 1) {
    for (let j = i + 1; j < byNeed.length; j += 1) {
      if (!met.has([byNeed[i], byNeed[j]].sort().join('|'))) return [byNeed[i], byNeed[j]];
    }
  }
  return null;
};

/** "S2 E4". Episodes are stored as the last one watched, so the next one is always +1. */
export const nextEpisodeLabel = (progress: Progress): string | null => {
  const { current_season: season, current_episode: episode } = progress;
  if (!season && !episode) return null;
  if (season && !episode) return `S${season} E1`;
  return `S${season ?? 1} E${(episode ?? 0) + 1}`;
};

/** How far in, as a fraction, when we know the total. Null when we can't say honestly. */
export const progressFraction = (progress: Progress): number | null => {
  const { current_season: season, current_episode: episode, seasons, episodes } = progress;
  if (!episodes || !seasons || !season || !episode) return null;
  const perSeason = episodes / seasons;
  const watched = (season - 1) * perSeason + episode;
  return Math.min(1, Math.max(0, watched / episodes));
};

/** Advancing one episode, rolling into the next season when the count runs out. */
export const advance = (progress: Progress): { current_season: number; current_episode: number } => {
  const season = progress.current_season ?? 1;
  const episode = progress.current_episode ?? 0;
  const perSeason = progress.episodes && progress.seasons ? Math.round(progress.episodes / progress.seasons) : null;

  if (perSeason && episode + 1 > perSeason && (!progress.seasons || season < progress.seasons)) {
    return { current_season: season + 1, current_episode: 1 };
  }
  return { current_season: season, current_episode: episode + 1 };
};
