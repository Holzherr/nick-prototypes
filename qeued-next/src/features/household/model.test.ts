import { describe, expect, it } from 'vitest';
import {
  type MemberEntry,
  type Profile,
  certificationAllowed,
  certificationRank,
  displayName,
  initials,
  isManaged,
  sharedQueue,
  unanimous,
} from './model';

const profile = (over: Partial<Profile> = {}): Profile => ({
  id: 'p1', name: 'Nick', user_id: 'u1', owner_user_id: null, max_certification: null, ...over,
});
const kid = profile({ id: 'p2', name: 'Tara', user_id: null, owner_user_id: 'u1', max_certification: 'PG' });

const entry = (over: Partial<MemberEntry> = {}): MemberEntry => ({
  profile_id: 'p1', title_id: 't1', title_name: 'Devs', status: 'want_to_watch', genres: ['Sci-Fi'], ...over,
});

describe('isManaged', () => {
  it('is true for a profile with an owner and no login', () => {
    expect(isManaged(kid)).toBe(true);
  });

  it('is false for a profile with its own login', () => {
    expect(isManaged(profile())).toBe(false);
  });
});

describe('certificationAllowed', () => {
  it('lets an unrestricted profile see anything', () => {
    expect(certificationAllowed('18', null)).toBe(true);
  });

  it('allows a certificate at the cap', () => {
    expect(certificationAllowed('PG', 'PG')).toBe(true);
  });

  it('blocks a certificate above the cap', () => {
    expect(certificationAllowed('15', 'PG')).toBe(false);
  });

  it('blocks an unrated title for a capped profile — unknown is not safe', () => {
    expect(certificationAllowed(null, 'PG')).toBe(false);
  });

  it('sorts 12A between 12 and 15', () => {
    expect(certificationRank('12A')).toBeGreaterThan(certificationRank('12'));
    expect(certificationRank('12A')).toBeLessThan(certificationRank('15'));
  });
});

describe('sharedQueue', () => {
  it('collapses a title two people want into one row', () => {
    const queue = sharedQueue([entry(), entry({ profile_id: 'p2' })]);
    expect(queue).toHaveLength(1);
    expect(queue[0].wanted_by).toEqual(['p1', 'p2']);
  });

  it('puts agreed titles above solo ones', () => {
    const queue = sharedQueue([
      entry({ title_id: 't1', title_name: 'Solo' }),
      entry({ title_id: 't2', title_name: 'Agreed' }),
      entry({ title_id: 't2', title_name: 'Agreed', profile_id: 'p2' }),
    ]);
    expect(queue[0].title_name).toBe('Agreed');
  });

  it('ignores anything already watched', () => {
    expect(sharedQueue([entry({ status: 'watched' })])).toHaveLength(0);
  });

  it('never counts one profile twice for the same title', () => {
    const queue = sharedQueue([entry(), entry()]);
    expect(queue[0].wanted_by).toEqual(['p1']);
  });

  it('hides titles above a capped profile’s certificate', () => {
    const entries = [entry({ certification: '18' }), entry({ title_id: 't2', title_name: 'Paddington', certification: 'PG' })];
    const queue = sharedQueue(entries, kid);
    expect(queue.map((q) => q.title_name)).toEqual(['Paddington']);
  });
});

describe('unanimous', () => {
  it('returns only what every member wants', () => {
    const queue = sharedQueue([
      entry({ title_id: 't1', title_name: 'Both' }),
      entry({ title_id: 't1', title_name: 'Both', profile_id: 'p2' }),
      entry({ title_id: 't2', title_name: 'One' }),
    ]);
    expect(unanimous(queue, ['p1', 'p2']).map((q) => q.title_name)).toEqual(['Both']);
  });

  it('is empty for a group of one — agreement needs two', () => {
    const queue = sharedQueue([entry()]);
    expect(unanimous(queue, ['p1'])).toEqual([]);
  });
});

describe('display helpers', () => {
  it('falls back when a profile has no name', () => {
    expect(displayName(profile({ name: null }))).toBe('Unnamed');
  });

  it('takes two initials from a full name', () => {
    expect(initials(profile({ name: 'Tara Holzherr' }))).toBe('TH');
  });

  it('takes one initial from a single name', () => {
    expect(initials(profile({ name: 'Nick' }))).toBe('N');
  });
});
