export type WatchStatus = 'watched' | 'watching' | 'want_to_watch' | 'dropped';

/** Tab order everywhere a library is listed. */
export const STATUS_ORDER: WatchStatus[] = ['watched', 'watching', 'want_to_watch', 'dropped'];

export const STATUS_LABELS: Record<WatchStatus, string> = {
  watched: 'Watched',
  watching: 'Watching',
  want_to_watch: 'Want to Watch',
  dropped: 'Dropped',
};

export const statusLabel = (status: WatchStatus) => STATUS_LABELS[status];

/** "Nick <verb> Severance" in the following feed. */
export const feedVerb = (status: WatchStatus) =>
  status === 'want_to_watch' ? 'wants to watch' : status === 'watching' ? 'is watching' : status;

/** One decimal, em dash when unknown. */
export const formatRating = (rating: number | null | undefined) => (rating == null ? '—' : rating.toFixed(1));

/** The want-to-watch tab is ordered by desire ranking (1 = most wanted, unranked last); other tabs keep DB order. */
export const sortEntries = <T extends { desire_ranking: number | null }>(entries: T[], status: WatchStatus): T[] =>
  status === 'want_to_watch' ? [...entries].sort((a, b) => (a.desire_ranking || 99) - (b.desire_ranking || 99)) : entries;
