import { describe, expect, it } from 'vitest';
import {
  type Axes,
  type Candidate,
  buildSlate,
  calibrationError,
  calibratedSelect,
  combineScore,
  diversify,
  genreMix,
  heuristicAxes,
  watchableNow,
} from '../../../supabase/functions/_shared/ranking';

const axes = (over: Partial<Axes> = {}): Axes => ({ tone: 50, theme: 50, craft: 50, novelty: 50, effort: 50, ...over });
const candidate = (name: string, genres: string[], over: Partial<Axes> = {}, providers?: string[]): Candidate =>
  ({ name, genres, axes: axes(over), providers });

describe('combineScore', () => {
  it('returns the flat value when every axis agrees', () => {
    expect(combineScore(axes({}))).toBe(50);
  });

  it('weights tone above effort', () => {
    const tonal = combineScore(axes({ tone: 100, effort: 0 }));
    const easy = combineScore(axes({ tone: 0, effort: 100 }));
    expect(tonal).toBeGreaterThan(easy);
  });

  it('clamps axes that arrive out of range', () => {
    expect(combineScore(axes({ tone: 500 }))).toBeLessThanOrEqual(100);
  });
});

describe('genreMix', () => {
  it('normalises to one', () => {
    const mix = genreMix([{ genres: ['Thriller'] }, { genres: ['Comedy'] }]);
    expect(Object.values(mix).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });

  it('counts a five-star watch above an unrated one', () => {
    const mix = genreMix([{ genres: ['Thriller'], rating: 5 }, { genres: ['Comedy'], rating: 1 }]);
    expect(mix.Thriller).toBeGreaterThan(mix.Comedy);
  });

  it('discounts what they dropped', () => {
    const mix = genreMix([{ genres: ['Thriller'] }, { genres: ['Comedy'], status: 'dropped' }]);
    expect(mix.Thriller).toBeGreaterThan(mix.Comedy);
  });

  it('survives an empty history', () => {
    expect(genreMix([])).toEqual({});
  });
});

describe('calibrationError', () => {
  it('is zero when the slate matches the viewer', () => {
    const target = { Thriller: 0.5, Comedy: 0.5 };
    expect(calibrationError(target, target)).toBeCloseTo(0, 2);
  });

  it('grows when the slate ignores a genre they watch', () => {
    const target = { Thriller: 0.5, Comedy: 0.5 };
    expect(calibrationError(target, { Thriller: 1 })).toBeGreaterThan(0.2);
  });
});

describe('calibratedSelect', () => {
  it('keeps the minority genre a viewer actually watches', () => {
    // Eight thrillers scoring well, two comedies scoring slightly less: pure argmax
    // would return thrillers only.
    const pool = [
      ...Array.from({ length: 8 }, (_, i) => candidate(`Thriller ${i}`, ['Thriller'], { tone: 90 })),
      ...Array.from({ length: 2 }, (_, i) => candidate(`Comedy ${i}`, ['Comedy'], { tone: 80 })),
    ];
    const target = { Thriller: 0.7, Comedy: 0.3 };
    const picked = calibratedSelect(pool, target, 3, { lambda: 0.5 });
    expect(picked.some((p) => p.genres.includes('Comedy'))).toBe(true);
  });

  it('collapses to pure score when lambda is zero', () => {
    const pool = [candidate('Weak', ['Comedy'], { tone: 10 }), candidate('Strong', ['Thriller'], { tone: 100 })];
    const [first] = calibratedSelect(pool, { Comedy: 1 }, 1, { lambda: 0 });
    expect(first.name).toBe('Strong');
  });

  it('never returns more than the pool holds', () => {
    expect(calibratedSelect([candidate('Only', ['Drama'])], { Drama: 1 }, 5)).toHaveLength(1);
  });
});

describe('diversify', () => {
  it('avoids a slate of near-identical picks', () => {
    const pool = [
      candidate('Spy A', ['Thriller', 'Spy'], { tone: 95 }),
      candidate('Spy B', ['Thriller', 'Spy'], { tone: 94 }),
      candidate('Doc', ['Documentary'], { tone: 70 }),
    ];
    const picked = diversify(pool, 2);
    expect(picked.map((p) => p.name)).toContain('Doc');
  });

  it('still leads with the strongest candidate', () => {
    const pool = [candidate('Best', ['Drama'], { tone: 99 }), candidate('Other', ['Comedy'], { tone: 40 })];
    expect(diversify(pool, 2)[0].name).toBe('Best');
  });
});

describe('watchableNow', () => {
  const pool = [
    candidate('On Netflix', ['Drama'], {}, ['Netflix']),
    candidate('Rental only', ['Drama'], {}, ['Apple TV']),
    candidate('Unknown', ['Drama'], {}),
  ];

  it('keeps only what their subscriptions cover', () => {
    expect(watchableNow(pool, ['Netflix']).map((c) => c.name)).toEqual(['On Netflix']);
  });

  it('lets everything through when paid options are allowed', () => {
    expect(watchableNow(pool, ['Netflix'], { allowPaid: true })).toHaveLength(3);
  });

  it('matches provider names case-insensitively', () => {
    expect(watchableNow(pool, ['netflix'])).toHaveLength(1);
  });
});

describe('buildSlate', () => {
  const history = [
    { genres: ['Thriller'], rating: 5 },
    { genres: ['Thriller'], rating: 4 },
    { genres: ['Sci-Fi'], rating: 4 },
    { genres: ['Comedy'], rating: 3 },
  ];

  it('returns the requested number of picks plus a wildcard', () => {
    const pool = Array.from({ length: 10 }, (_, i) =>
      candidate(`T${i}`, i % 3 === 0 ? ['Comedy'] : ['Thriller'], { tone: 90 - i, novelty: i * 10 }));
    const { picks, wildcard } = buildSlate(pool, history, { size: 3 });
    expect(picks).toHaveLength(3);
    expect(wildcard).not.toBeNull();
  });

  it('never repeats a pick as the wildcard', () => {
    const pool = Array.from({ length: 6 }, (_, i) => candidate(`T${i}`, ['Thriller'], { novelty: i * 10 }));
    const { picks, wildcard } = buildSlate(pool, history, { size: 3 });
    expect(picks.map((p) => p.name)).not.toContain(wildcard?.name);
  });

  it('handles an empty candidate pool', () => {
    expect(buildSlate([], history)).toEqual({ picks: [], wildcard: null });
  });
});

describe('heuristicAxes', () => {
  const mix = { Thriller: 0.6, 'Sci-Fi': 0.3, Comedy: 0.1 };

  it('scores a title in the viewer’s main genre above one outside it', () => {
    const inside = heuristicAxes({ genres: ['Thriller'] }, mix);
    const outside = heuristicAxes({ genres: ['Documentary'] }, mix);
    expect(inside.theme).toBeGreaterThan(outside.theme);
  });

  it('treats an unfamiliar genre as novel', () => {
    expect(heuristicAxes({ genres: ['Documentary'] }, mix).novelty).toBeGreaterThan(
      heuristicAxes({ genres: ['Thriller'] }, mix).novelty,
    );
  });

  it('rates a film easier to start than a six-season series', () => {
    const film = heuristicAxes({ genres: [], type: 'movie', runtime_minutes: 100 }, mix);
    const long = heuristicAxes({ genres: [], type: 'series', runtime_minutes: 55, seasons: 6 }, mix);
    expect(film.effort).toBeGreaterThan(long.effort);
  });

  it('puts a title with no rating held mid-scale rather than at zero', () => {
    expect(heuristicAxes({ genres: [] }, mix).craft).toBe(55);
  });

  it('keeps every axis within range', () => {
    const axes = heuristicAxes({ genres: ['Thriller', 'Sci-Fi'], imdb_rating: 9.5, runtime_minutes: 30 }, mix);
    for (const value of Object.values(axes)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });

  it('works with no history at all', () => {
    expect(() => heuristicAxes({ genres: ['Drama'] }, {})).not.toThrow();
  });

  // The reason the columns exist: genre alone cannot separate these two.
  it('separates two same-genre titles by tone', () => {
    const viewer = { genres: mix, tones: { bleak: 0.7, tense: 0.3 } };
    const bleak = heuristicAxes({ genres: ['Drama'], tones: ['bleak'] }, viewer);
    const warm = heuristicAxes({ genres: ['Drama'], tones: ['warm'] }, viewer);
    expect(bleak.tone).toBeGreaterThan(warm.tone);
  });

  it('reads theme from themes rather than genre when the title is tagged', () => {
    const viewer = { genres: mix, themes: { espionage: 0.8, family: 0.2 } };
    const spy = heuristicAxes({ genres: ['Drama'], themes: ['espionage'] }, viewer);
    const other = heuristicAxes({ genres: ['Drama'], themes: ['addiction'] }, viewer);
    expect(spy.theme).toBeGreaterThan(other.theme);
    expect(other.novelty).toBeGreaterThan(spy.novelty);
  });

  it('falls back to genre for a title the catalogue has not tagged yet', () => {
    const viewer = { genres: mix, tones: { bleak: 1 }, themes: { espionage: 1 } };
    const untagged = heuristicAxes({ genres: ['Thriller'] }, viewer);
    const genreOnly = heuristicAxes({ genres: ['Thriller'] }, mix);
    expect(untagged.tone).toBe(genreOnly.tone);
    expect(untagged.theme).toBe(genreOnly.theme);
  });

  it('falls back to genre when the viewer has no tagged history', () => {
    const viewer = { genres: mix, tones: {}, themes: {} };
    expect(heuristicAxes({ genres: ['Thriller'], tones: ['bleak'] }, viewer).tone).toBe(
      heuristicAxes({ genres: ['Thriller'] }, mix).tone,
    );
  });
});
