/**
 * Argument handling for the MCP tools, kept free of Deno globals so vitest can load it.
 *
 * Agents send whatever they like, so every number is clamped and every optional field the
 * agent left out stays out of the write — an upsert sets each column it is given, and a
 * null there erased a rating or review the user had written in the app.
 */

/** An integer within [min, max], or the fallback when the value is missing or not a number. */
export const intArg = (value: unknown, { min, max, fallback }: { min: number; max: number; fallback: number }): number => {
  const n = typeof value === 'string' && value.trim() === '' ? NaN : Number(value ?? NaN);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
};

/** Text the agent gave, trimmed, or undefined so the column is left alone. */
export const textArg = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const text = String(value).trim();
  return text ? text : undefined;
};

/** Drops undefined fields, so an upsert touches only the columns the agent meant to set. */
export const definedOnly = <T extends Record<string, unknown>>(row: T): Partial<T> =>
  Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined)) as Partial<T>;

/**
 * add_to_queue on a title already tracked. Putting something on the want-to-watch list must
 * not throw away that they are part-way through it or have finished it; it only revives a
 * dropped title. Returns the status to write, or null to leave the entry's status alone.
 */
export const queueStatusFor = (existing: string | null | undefined): 'want_to_watch' | null =>
  !existing || existing === 'want_to_watch' || existing === 'dropped' ? 'want_to_watch' : null;

/**
 * The request whats_on_tonight forwards to watch-tonight. watch-tonight resolves its caller
 * from the bearer token and turns the anon key away, so the MCP server, having checked the
 * agent token itself, vouches with the service key and names the profile's account.
 */
export const tonightRequest = (
  origin: string,
  profile: { id: string; user_id: string | null },
  args: { mood?: unknown; time?: unknown },
  serviceKey: string,
): Request =>
  new Request(`${origin}/functions/v1/watch-tonight`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}` },
    body: JSON.stringify({ user_id: profile.user_id ?? profile.id, profile_id: profile.id, mood: args.mood, time: args.time }),
  });
