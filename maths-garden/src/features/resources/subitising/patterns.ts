import { mulberry32 } from '@/shared/utils/random';

/**
 * Dot arrangements for subitising, shared by the printable cards and the Quick Peek game so paper and
 * screen look the same. Coordinates are in a 100 × 72 box (a playing card on its side).
 *
 * Best practice these follow: start with the familiar dice patterns, mix in scattered and row layouts so
 * a child can't just memorise one picture, use five and ten frames to anchor "5 and some more", and from 6
 * upward show two small groups (4 and 3 make 7) — conceptual subitising — rather than a crowd to count.
 */
export type Arrangement = 'dice' | 'scatter' | 'line' | 'frame' | 'split';

export const CARD_W = 100;
export const CARD_H = 72;

export interface ArrangementInfo {
  id: Arrangement;
  name: string;
  hint: string;
  min: number;
  max: number;
}

export const ARRANGEMENTS: readonly ArrangementInfo[] = [
  { id: 'dice', name: 'Dice', hint: 'The dice patterns. Start here.', min: 1, max: 6 },
  { id: 'scatter', name: 'Scattered', hint: 'Random spots, so one picture can’t just be memorised.', min: 1, max: 6 },
  { id: 'line', name: 'In a row', hint: 'A line of dots. Harder than it looks past 4.', min: 1, max: 5 },
  { id: 'frame', name: 'Five & ten frames', hint: 'Filled boxes. Builds “5 and some more”.', min: 1, max: 10 },
  { id: 'split', name: 'Two groups', hint: 'Two colour groups (4 and 3 make 7). Seeing the parts of a number.', min: 3, max: 10 },
];

export const arrangementsFor = (n: number) => ARRANGEMENTS.filter((a) => n >= a.min && n <= a.max);

export interface Spot {
  x: number;
  y: number;
  r: number;
  group: 0 | 1;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Layout =
  | { kind: 'spots'; spots: Spot[]; halos: Box[] }
  | { kind: 'frame'; rows: 1 | 2; columns: 5; cell: number; x: number; y: number; filled: number };

/** Pip positions on a 3 × 3 grid (column, row). */
const PIPS: Record<number, readonly (readonly [number, number])[]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
};

const dice = (n: number, x: number, y: number, size: number, group: 0 | 1): Spot[] =>
  (PIPS[n] ?? []).map(([c, r]) => ({ x: x + size * (0.18 + 0.32 * c), y: y + size * (0.18 + 0.32 * r), r: size * 0.11, group }));

/** How a number splits into two dice-sized groups: 7 → 4 and 3, 10 → 5 and 5. */
export const splitParts = (n: number): [number, number] => {
  const a = Math.min(5, Math.ceil(n / 2));
  return [a, n - a];
};

function scatter(n: number, seed: number): Spot[] {
  const rng = mulberry32(seed * 97 + n * 13);
  const r = n <= 3 ? 8 : n <= 5 ? 7 : 6;
  const margin = r + 4;
  const spots: Spot[] = [];
  let minGap = r * 2 + 7;
  for (let attempt = 1; spots.length < n; attempt++) {
    if (attempt % 300 === 0) minGap *= 0.9;
    const x = margin + rng() * (CARD_W - 2 * margin);
    const y = margin + rng() * (CARD_H - 2 * margin);
    if (spots.every((s) => Math.hypot(s.x - x, s.y - y) >= minGap)) spots.push({ x, y, r, group: 0 });
  }
  return spots;
}

export function layout(n: number, arrangement: Arrangement, seed = 1): Layout {
  switch (arrangement) {
    case 'dice':
      return { kind: 'spots', spots: dice(n, (CARD_W - 62) / 2, (CARD_H - 62) / 2, 62, 0), halos: [] };
    case 'split': {
      const [a, b] = splitParts(n);
      const halos = [
        { x: 5, y: 15, w: 42, h: 42 },
        { x: 53, y: 15, w: 42, h: 42 },
      ];
      return { kind: 'spots', spots: [...dice(a, 6, 16, 40, 0), ...dice(b, 54, 16, 40, 1)], halos };
    }
    case 'line': {
      const gap = 84 / Math.max(n, 1);
      const r = Math.min(7, gap * 0.34);
      return { kind: 'spots', spots: Array.from({ length: n }, (_, i) => ({ x: 8 + gap * (i + 0.5), y: CARD_H / 2, r, group: 0 as const })), halos: [] };
    }
    case 'frame': {
      const rows = n > 5 ? 2 : 1;
      const cell = 16;
      return { kind: 'frame', rows, columns: 5, cell, x: (CARD_W - cell * 5) / 2, y: (CARD_H - cell * rows) / 2, filled: n };
    }
    case 'scatter':
      return { kind: 'spots', spots: scatter(n, seed), halos: [] };
  }
}
