import { describe, expect, it } from 'vitest';
import { buildCards, cardsLink, DEFAULT_OPTIONS, optionsFromParams, paginate, type CardFace } from './cards';

describe('buildCards', () => {
  it('makes one card per number per suitable arrangement', () => {
    // 1–3: dice, scatter, line, frame for each (12) + two groups for 3 only (1)
    expect(buildCards({ ...DEFAULT_OPTIONS, stage: 1 })).toHaveLength(13);
    // 6–10: frame and two groups for each (10) + dice and scatter for 6 (2)
    const stage3 = buildCards({ ...DEFAULT_OPTIONS, stage: 3 });
    expect(stage3).toHaveLength(12);
    expect(stage3.every((c) => c.n >= 6 && c.n <= 10)).toBe(true);
  });

  it('respects chosen arrangements and adds numeral cards', () => {
    const cards = buildCards({ ...DEFAULT_OPTIONS, stage: 2, arrangements: ['dice'], numeralCards: true });
    expect(cards.filter((c) => c.kind === 'dots')).toHaveLength(5);
    expect(cards.filter((c) => c.kind === 'numeral').map((c) => c.n)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('paginate', () => {
  const cards: CardFace[] = [1, 2, 3].map((n) => ({ kind: 'dots', n, arrangement: 'dice', seed: 1 }));

  it('mirrors columns on the back sheet so answers line up when flipped on the long edge', () => {
    const [front, back] = paginate(cards, 'small', true);
    expect(front.cells.slice(0, 4).map((c) => c?.n ?? null)).toEqual([1, 2, 3, null]);
    expect(back.side).toBe('back');
    expect(back.cells.slice(0, 4).map((c) => (c ? `${c.kind}:${c.n}` : null))).toEqual(['numeral:2', 'numeral:1', null, 'numeral:3']);
  });

  it('skips backs when answers are not on the back', () => {
    expect(paginate(cards, 'large', false).map((s) => s.side)).toEqual(['front', 'front']);
  });
});

describe('links', () => {
  it('round-trips stage, name and icon', () => {
    const hash = cardsLink(2, 'Tara', '🦄');
    const params = new URLSearchParams(hash.split('?')[1]);
    expect(optionsFromParams(params)).toMatchObject({ stage: 2, name: 'Tara', icon: '🦄' });
    expect(optionsFromParams(new URLSearchParams('stage=9')).stage).toBe(1);
  });
});
