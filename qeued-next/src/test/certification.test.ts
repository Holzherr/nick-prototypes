import { describe, expect, it } from 'vitest';
import { allowedForAll } from '../../supabase/functions/_shared/certification.ts';
import { certificationAllowed } from '../features/household/model';

describe('allowedForAll', () => {
  it('applies every cap on a shared slate', () => {
    expect(allowedForAll('12A', [null, '15'])).toBe(true);
    expect(allowedForAll('15', ['PG', null])).toBe(false);
    expect(allowedForAll('18', [])).toBe(true);
  });

  it('keeps an unrated title from a capped profile', () => {
    expect(allowedForAll(null, ['12'])).toBe(false);
  });

  it('is the same rule the household screen uses', () => {
    for (const cert of ['U', 'PG', '12', '15', '18', null, 'X']) {
      expect(allowedForAll(cert, ['PG'])).toBe(certificationAllowed(cert, 'PG'));
    }
  });
});
