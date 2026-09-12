/**
 * The weekly check-in: quick probes a grown-up runs away from the screen and scores by hand.
 * They cover rote counting (which no game tests) and cross-check the games with real objects.
 */
export type ProbeId = 'rote' | 'objects' | 'subitising' | 'numerals' | 'compare' | 'adding' | 'bonds' | 'fewer' | 'teens';

export interface Probe {
  id: ProbeId;
  name: string;
  how: string;
  /** Out of; null when the score is "highest reached". */
  max: number | null;
}

export const PROBES: readonly Probe[] = [
  { id: 'rote', name: 'Rote counting', how: 'Count aloud as high as possible. Score = highest number before the first slip.', max: null },
  { id: 'objects', name: 'Counting objects', how: 'Lay out buttons or grapes. Score = biggest set counted right, touching each one.', max: null },
  { id: 'subitising', name: 'Quick peek', how: 'Flash 1–5 dots (dice or cards) for 2 seconds, 10 times. Score = right without counting.', max: 10 },
  { id: 'numerals', name: 'Numerals 0–10', how: 'Shuffle numeral cards 0–10. Score = named correctly.', max: 11 },
  { id: 'compare', name: 'Which has more', how: 'Two small piles, 5 tries. Score = picked the bigger pile.', max: 5 },
  { id: 'adding', name: 'Adding on', how: '"You have 3 grapes, here is 1 more", real objects, within 5. 5 tries.', max: 5 },
  { id: 'bonds', name: 'Number bonds', how: 'Five counters out, hide some under your hand: "how many are hiding?" 5 tries.', max: 5 },
  { id: 'fewer', name: 'Taking away', how: '"You have 5 grapes, eat one — how many now?" Real objects, within 5. 5 tries.', max: 5 },
  { id: 'teens', name: 'Teen numbers', how: 'Ten counters in a line and some more beside them: "how many altogether?" 5 tries.', max: 5 },
];

export const isProbeId = (id: string): id is ProbeId => PROBES.some((p) => p.id === id);
