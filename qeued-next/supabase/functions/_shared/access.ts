/**
 * Who is calling, and which profiles they may read.
 *
 * The functions run with the service role, so RLS does not stand between a request body and
 * someone else's list. These checks are that gate: the caller comes from the JWT, never from
 * the body, and a profile is readable only when the caller controls it or shares a group with
 * it — the same rules the watch_entries policies apply (migration 0013).
 *
 * No Deno globals and no remote imports here, so vitest can load it directly.
 */

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type Caller = {
  userId: string;
  /** A service-role call (tools/refresh-slates.mjs): trusted to name any user or profile. */
  service: boolean;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string => typeof v === 'string' && UUID.test(v);

export const bearerToken = (req: Request): string | null => {
  const match = /^Bearer\s+(\S+)\s*$/i.exec(req.headers.get('Authorization') ?? '');
  return match ? match[1] : null;
};

/**
 * The caller. A signed-in user is whoever their JWT says; the anon key, a bad token or no token
 * is a 401. Only the service-role key may act for a user named in the body.
 */
export const resolveCaller = async (
  req: Request,
  opts: {
    serviceKey?: string | null;
    /** Resolves a user JWT to its user id, or null when it is not a signed-in user. */
    getUserId: (jwt: string) => Promise<string | null>;
    bodyUserId?: unknown;
  },
): Promise<Caller> => {
  const token = bearerToken(req);
  if (!token) throw new HttpError(401, 'Sign in required');
  if (opts.serviceKey && token === opts.serviceKey) {
    if (!isUuid(opts.bodyUserId)) throw new HttpError(400, 'user_id required');
    return { userId: opts.bodyUserId, service: true };
  }
  const userId = await opts.getUserId(token).catch(() => null);
  if (!userId) throw new HttpError(401, 'Sign in required');
  return { userId, service: false };
};

/** The slice of a supabase-js client these checks use. */
export type AccessDb = {
  // deno-lint-ignore no-explicit-any
  from: (table: string) => any;
  // deno-lint-ignore no-explicit-any
  rpc: (fn: string, args: Record<string, unknown>) => any;
};

/** True when the caller's account owns the profile or manages it (a child profile). */
export const controlsProfile = async (db: AccessDb, profileId: string, userId: string) => {
  const { data } = await db
    .from('profiles')
    .select('id')
    .eq('id', profileId)
    .or(`user_id.eq.${userId},owner_user_id.eq.${userId}`)
    .maybeSingle();
  return Boolean(data);
};

/** True when the caller can read this profile's list: they control it or share a group with it. */
export const canReadProfile = async (db: AccessDb, profileId: string, userId: string) => {
  if (await controlsProfile(db, profileId, userId)) return true;
  const { data } = await db.rpc('account_shares_group_with_profile', { p_profile_id: profileId, p_user_id: userId });
  return data === true;
};

/** Throws 400/403 unless the caller may read every profile named. Service calls pass. */
export const assertProfilesReadable = async (db: AccessDb, caller: Caller, ids: unknown[]) => {
  for (const id of ids) {
    if (id === undefined || id === null) continue;
    if (!isUuid(id)) throw new HttpError(400, 'Invalid profile id');
    if (caller.service) continue;
    if (!(await canReadProfile(db, id, caller.userId))) throw new HttpError(403, 'Not your profile');
  }
};

/**
 * Per-user budget for model calls, independent of mood or any other filter — changing the
 * filters changes the cache key, so without this each variation was a fresh paid call.
 *
 * Kept in ai_cache as a list of recent call times. The read-then-write can let a burst of
 * parallel requests through a call or two over the limit; that is fine for a cost cap.
 * Returns false when the budget is spent.
 */
export const takeModelCall = async (
  db: AccessDb,
  bucket: string,
  userId: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
) => {
  const key = `ratelimit:${bucket}:${userId}`;
  const { data } = await db.from('ai_cache').select('response_data').eq('cache_key', key).maybeSingle();
  const since = now - windowMs;
  const calls: number[] = (Array.isArray(data?.response_data?.calls) ? data.response_data.calls : [])
    .map((t: unknown) => Number(t))
    .filter((t: number) => Number.isFinite(t) && t > since);
  if (calls.length >= limit) return false;
  calls.push(now);
  await db.from('ai_cache').upsert(
    { cache_key: key, response_data: { calls }, expires_at: new Date(now + windowMs).toISOString() },
    { onConflict: 'cache_key' },
  );
  return true;
};
