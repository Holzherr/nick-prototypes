import { describe, expect, it } from 'vitest';
import { ARRANGEMENTS, CARD_H, CARD_W, layout, splitParts } from './patterns';

describe('subitising patterns', () => {
  it('draws exactly n inside the card for every valid arrangement', () => {
    for (const a of ARRANGEMENTS) {
      for (let n = a.min; n <= a.max; n++) {
        const l = layout(n, a.id, 5);
        if (l.kind === 'frame') {
          expect(l.filled).toBe(n);
          expect(l.x + l.cell * l.columns).toBeLessThanOrEqual(CARD_W);
          continue;
        }
        expect(l.spots).toHaveLength(n);
        for (const s of l.spots) {
          expect(s.x - s.r).toBeGreaterThanOrEqual(0);
          expect(s.x + s.r).toBeLessThanOrEqual(CARD_W);
          expect(s.y - s.r).toBeGreaterThanOrEqual(0);
          expect(s.y + s.r).toBeLessThanOrEqual(CARD_H);
        }
      }
    }
  });

  it('never overlaps scattered dots and repeats for the same seed', () => {
    for (let n = 1; n <= 6; n++) {
      for (let seed = 1; seed < 30; seed++) {
        const { spots } = layout(n, 'scatter', seed) as Extract<ReturnType<typeof layout>, { kind: 'spots' }>;
        for (let i = 0; i < spots.length; i++)
          for (let j = i + 1; j < spots.length; j++) expect(Math.hypot(spots[i].x - spots[j].x, spots[i].y - spots[j].y)).toBeGreaterThan(spots[i].r * 2);
        expect(layout(n, 'scatter', seed)).toEqual(layout(n, 'scatter', seed));
      }
    }
  });

  it('splits into two dice-sized groups', () => {
    expect(splitParts(3)).toEqual([2, 1]);
    expect(splitParts(7)).toEqual([4, 3]);
    expect(splitParts(10)).toEqual([5, 5]);
    const l = layout(7, 'split');
    expect(l.kind === 'spots' && l.spots.filter((s) => s.group === 1).length).toBe(3);
  });
});
