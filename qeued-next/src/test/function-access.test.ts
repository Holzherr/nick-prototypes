import { describe, expect, it, vi } from 'vitest';
import {
  type AccessDb,
  HttpError,
  assertProfilesReadable,
  resolveCaller,
  takeModelCall,
} from '../../supabase/functions/_shared/access.ts';

const ME = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const MY_KID = '33333333-3333-4333-8333-333333333333';
const HOUSEMATE = '44444444-4444-4444-8444-444444444444';
const STRANGER = '55555555-5555-4555-8555-555555555555';
const SERVICE = 'service-key';

const req = (auth?: string) => new Request('https://x/functions/v1/f', { method: 'POST', headers: auth ? { Authorization: auth } : {} });
const getUserId = async (jwt: string) => (jwt === 'user-jwt' ? ME : null);

const status = async (p: Promise<unknown>) => {
  try {
    await p;
    return 200;
  } catch (e) {
    return e instanceof HttpError ? e.status : 500;
  }
};

describe('resolveCaller', () => {
  it('takes the user from the JWT and ignores user_id in the body', async () => {
    const caller = await resolveCaller(req('Bearer user-jwt'), { serviceKey: SERVICE, getUserId, bodyUserId: OTHER });
    expect(caller).toEqual({ userId: ME, service: false });
  });

  it('rejects a missing token, the anon key and a bad token with 401', async () => {
    expect(await status(resolveCaller(req(), { serviceKey: SERVICE, getUserId, bodyUserId: OTHER }))).toBe(401);
    expect(await status(resolveCaller(req('Bearer anon-key'), { serviceKey: SERVICE, getUserId, bodyUserId: OTHER }))).toBe(401);
    const throws = async () => { throw new Error('network'); };
    expect(await status(resolveCaller(req('Bearer user-jwt'), { serviceKey: SERVICE, getUserId: throws }))).toBe(401);
  });

  it('lets only the service role act for the user named in the body', async () => {
    const caller = await resolveCaller(req(`Bearer ${SERVICE}`), { serviceKey: SERVICE, getUserId, bodyUserId: OTHER });
    expect(caller).toEqual({ userId: OTHER, service: true });
    expect(await status(resolveCaller(req(`Bearer ${SERVICE}`), { serviceKey: SERVICE, getUserId }))).toBe(400);
    // An unset service key must not match an empty or absent token.
    expect(await status(resolveCaller(req('Bearer '), { serviceKey: '', getUserId, bodyUserId: OTHER }))).toBe(401);
  });
});

/** A db whose profile ownership and group sharing are fixed tables. */
const fakeDb = (controls: string[], shares: string[]): AccessDb => ({
  from: () => {
    let id = '';
    const q = {
      select: () => q,
      eq: (_col: string, v: string) => { id = v; return q; },
      or: () => q,
      maybeSingle: async () => ({ data: controls.includes(id) ? { id } : null }),
    };
    return q;
  },
  rpc: async (_fn: string, args: Record<string, unknown>) => ({ data: shares.includes(args.p_profile_id as string) }),
});

describe('assertProfilesReadable', () => {
  const db = fakeDb([MY_KID], [HOUSEMATE]);
  const me = { userId: ME, service: false };

  it('allows profiles the caller controls or shares a group with, and no profile at all', async () => {
    expect(await status(assertProfilesReadable(db, me, [MY_KID, HOUSEMATE]))).toBe(200);
    expect(await status(assertProfilesReadable(db, me, [undefined, null]))).toBe(200);
  });

  it('refuses anyone else\'s profile with 403 and a malformed id with 400', async () => {
    expect(await status(assertProfilesReadable(db, me, [MY_KID, STRANGER]))).toBe(403);
    expect(await status(assertProfilesReadable(db, me, ['x,user_id.neq.0']))).toBe(400);
  });

  it('lets the service role read any profile', async () => {
    expect(await status(assertProfilesReadable(db, { userId: OTHER, service: true }, [STRANGER]))).toBe(200);
  });
});

describe('takeModelCall', () => {
  const memoryDb = () => {
    const rows = new Map<string, unknown>();
    const upsert = vi.fn(async (row: { cache_key: string; response_data: unknown }) => { rows.set(row.cache_key, row.response_data); });
    const db: AccessDb = {
      from: () => {
        let key = '';
        const q = {
          select: () => q,
          eq: (_c: string, v: string) => { key = v; return q; },
          maybeSingle: async () => ({ data: rows.has(key) ? { response_data: rows.get(key) } : null }),
          upsert,
        };
        return q;
      },
      rpc: async () => ({ data: null }),
    };
    return db;
  };

  it('caps calls per user inside the window and frees them after it', async () => {
    const db = memoryDb();
    const hour = 3_600_000;
    const t0 = 1_000_000_000;
    expect(await takeModelCall(db, 'tonight', ME, 2, hour, t0)).toBe(true);
    expect(await takeModelCall(db, 'tonight', ME, 2, hour, t0 + 1)).toBe(true);
    expect(await takeModelCall(db, 'tonight', ME, 2, hour, t0 + 2)).toBe(false);
    // Another account has its own budget.
    expect(await takeModelCall(db, 'tonight', OTHER, 2, hour, t0 + 3)).toBe(true);
    expect(await takeModelCall(db, 'tonight', ME, 2, hour, t0 + hour + 1)).toBe(true);
  });
});
