import { describe, expect, it } from 'vitest';
import { ageLabel } from './model';

describe('ageLabel', () => {
  it('counts whole months', () => {
    expect(ageLabel('2022-05-23', new Date(2026, 8, 11))).toBe('4 years 3 months');
    expect(ageLabel('2022-05-23', new Date(2026, 10, 23))).toBe('4 years 6 months');
    expect(ageLabel('2025-09-01', new Date(2026, 8, 11))).toBe('1 year');
  });

  it('handles missing or future dates', () => {
    expect(ageLabel(null)).toBeNull();
    expect(ageLabel('2030-01-01', new Date(2026, 8, 11))).toBeNull();
  });
});
