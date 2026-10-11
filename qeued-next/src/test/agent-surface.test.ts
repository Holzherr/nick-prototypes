import { describe, expect, it } from 'vitest';
import { resolveCaller } from '../../supabase/functions/_shared/access.ts';
import { definedOnly, intArg, queueStatusFor, textArg, tonightRequest } from '../../supabase/functions/_shared/agent.ts';

const SERVICE = 'service-key';
const ACCOUNT = '11111111-1111-4111-8111-111111111111';
const PROFILE = '22222222-2222-4222-8222-222222222222';
const getUserId = async () => null;

describe('tonightRequest', () => {
  it('is accepted by watch-tonight as a service call for the profile’s account', async () => {
    const req = tonightRequest('https://x', { id: PROFILE, user_id: ACCOUNT }, { mood: 'easy' }, SERVICE);
    const body = await req.clone().json();
    const caller = await resolveCaller(req, { serviceKey: SERVICE, getUserId, bodyUserId: body.user_id });
    expect(caller).toEqual({ userId: ACCOUNT, service: true });
    expect(body).toMatchObject({ profile_id: PROFILE, mood: 'easy' });
    expect(new URL(req.url).pathname).toBe('/functions/v1/watch-tonight');
  });

  it('names the profile itself for a list nobody has claimed yet', async () => {
    const body = await tonightRequest('https://x', { id: PROFILE, user_id: null }, {}, SERVICE).json();
    expect(body.user_id).toBe(PROFILE);
  });
});

describe('intArg', () => {
  const range = { min: 1, max: 25, fallback: 10 };
  it('falls back for a missing, empty or non-numeric value', () => {
    expect(intArg(undefined, range)).toBe(10);
    expect(intArg('', range)).toBe(10);
    expect(intArg('lots', range)).toBe(10);
    expect(intArg(Number.NaN, range)).toBe(10);
  });
  it('clamps into range and drops the fraction', () => {
    expect(intArg(500, range)).toBe(25);
    expect(intArg(-3, range)).toBe(1);
    expect(intArg('7.9', range)).toBe(7);
  });
});

describe('textArg and definedOnly', () => {
  it('leaves out what the agent did not say, so an upsert keeps the stored value', () => {
    const row = definedOnly({ status: 'watched', review: textArg(undefined), watched_rating: undefined, notes: textArg('  ') });
    expect(row).toEqual({ status: 'watched' });
  });
  it('keeps what it did say, trimmed', () => {
    expect(definedOnly({ review: textArg(' loved it ') })).toEqual({ review: 'loved it' });
  });
});

describe('queueStatusFor', () => {
  it('queues a new title and revives a dropped one', () => {
    expect(queueStatusFor(null)).toBe('want_to_watch');
    expect(queueStatusFor('want_to_watch')).toBe('want_to_watch');
    expect(queueStatusFor('dropped')).toBe('want_to_watch');
  });
  it('never sends something part-way through or finished back to the queue', () => {
    expect(queueStatusFor('watching')).toBeNull();
    expect(queueStatusFor('watched')).toBeNull();
  });
});
