import { describe, expect, it } from 'vitest';
import { nameCandidates } from './sound';

/**
 * Respelling is the only lever there is — Safari's speech API takes no SSML and no phonemes — and which
 * respelling sounds right depends on the voice installed on the device. So the job here is only to offer a
 * sensible shortlist; a grown-up picks by ear.
 */
describe('nameCandidates', () => {
  it('always offers the name as written first, so doing nothing is a real choice', () => {
    expect(nameCandidates('Tara')[0]).toBe('Tara');
  });

  it('offers the respellings that actually shift an English voice', () => {
    const candidates = nameCandidates('Tara');
    expect(candidates).toContain('Tahra'); // longer a
    expect(candidates).toContain('Tarra'); // shorter a
    expect(candidates).toContain('Tah-ra'); // two beats
  });

  it('never repeats a candidate, however the name is cased', () => {
    const candidates = nameCandidates('Tara');
    const lowered = candidates.map((c) => c.toLowerCase());
    expect(new Set(lowered).size).toBe(lowered.length);
  });

  it('works for names it has never seen', () => {
    for (const name of ['Sara', 'Priyanka', 'Nico', 'Bo']) {
      const candidates = nameCandidates(name);
      expect(candidates[0]).toBe(name);
      expect(candidates.length).toBeGreaterThan(1);
    }
  });

  it('gives nothing for a blank name rather than a list of empty strings', () => {
    expect(nameCandidates('')).toEqual([]);
    expect(nameCandidates('   ')).toEqual([]);
  });

  it('keeps the list short enough to try by ear', () => {
    expect(nameCandidates('Tara').length).toBeLessThanOrEqual(5);
  });
});
