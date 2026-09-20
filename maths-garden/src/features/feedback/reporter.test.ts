import { beforeEach, describe, expect, it } from 'vitest';
import { isKind, isReporter, KINDS, readReporter, REPORTERS, writeReporter } from './reporter';

/**
 * The reporter is a fixed choice, remembered on the device. A reload is a fresh call to readReporter
 * against the same localStorage, which is what jsdom gives each test here.
 */
describe('feedback reporter', () => {
  beforeEach(() => localStorage.clear());

  it('offers exactly three reporters and three kinds', () => {
    expect(REPORTERS).toEqual(['Nick', 'Priyanka', 'Tara']);
    expect(KINDS.map((k) => k.id)).toEqual(['bug', 'idea', 'tara-noticed']);
  });

  it('starts with nobody chosen', () => {
    expect(readReporter()).toBeNull();
  });

  it('remembers the choice across a reload', () => {
    writeReporter('Priyanka');
    expect(readReporter()).toBe('Priyanka');
    expect(localStorage.getItem('maths-garden:feedback-reporter')).toBe('"Priyanka"');
  });

  it('forgets when asked', () => {
    writeReporter('Nick');
    writeReporter(null);
    expect(readReporter()).toBeNull();
    expect(localStorage.getItem('maths-garden:feedback-reporter')).toBeNull();
  });

  it('reads anything that is not one of the three as not chosen', () => {
    localStorage.setItem('maths-garden:feedback-reporter', JSON.stringify('Someone else'));
    expect(readReporter()).toBeNull();
    localStorage.setItem('maths-garden:feedback-reporter', 'not json');
    expect(readReporter()).toBeNull();
  });

  it('accepts only the listed values', () => {
    expect(isReporter('Tara')).toBe(true);
    expect(isReporter('tara')).toBe(false);
    expect(isKind('tara-noticed')).toBe(true);
    expect(isKind('question')).toBe(false);
  });
});
