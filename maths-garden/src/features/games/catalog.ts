/** The five games, the skill each one trains, and how hard each level is. */
export type GameId = 'peek' | 'count' | 'find' | 'more' | 'add';

/** One level of a game. Only `max` is required; the rest tighten the challenge at the higher levels. */
export interface GameLevel {
  /** Largest number used. */
  max: number;
  /** Smallest answer (or starting group); defaults to the easiest start. */
  min?: number;
  /** Answer buttons shown (default 3; Find the Number always shows 6). */
  choices?: number;
  /** Quick Peek: how long the dots stay up (default 2000ms). */
  peekMs?: number;
  /** Which Has More?: the two groups differ by at most this much. */
  gap?: number;
  /** One More Unicorn: most unicorns that can arrive (default 3). */
  extraMax?: number;
}

export interface Game {
  id: GameId;
  name: string;
  emoji: string;
  skill: string;
  /** One line for the grown-ups screen. */
  about: string;
  /** Index 0 is the easiest. Levels 1–3 match printable stages 1–3; levels 4–5 are challenge levels. */
  levels: readonly GameLevel[];
}

export const GAMES: readonly Game[] = [
  {
    id: 'peek',
    name: 'Quick Peek',
    emoji: '👀',
    skill: 'Subitising',
    about: 'Dots flash up, then hide. Say how many without counting.',
    levels: [{ max: 3 }, { max: 5 }, { max: 10 }, { min: 4, max: 10, peekMs: 1200, choices: 4 }, { min: 6, max: 10, peekMs: 800, choices: 5 }],
  },
  {
    id: 'count',
    name: 'Count With Me',
    emoji: '🦋',
    skill: 'Counting objects',
    about: 'Tap each object once while counting, then pick the total.',
    levels: [{ max: 5 }, { max: 8 }, { max: 12 }, { min: 8, max: 16, choices: 4 }, { min: 12, max: 20, choices: 5 }],
  },
  {
    id: 'find',
    name: 'Find the Number',
    emoji: '🔢',
    skill: 'Numeral recognition',
    about: 'Hears a number and taps the matching numeral.',
    levels: [{ max: 5 }, { max: 10 }, { max: 20 }, { min: 10, max: 50 }, { min: 20, max: 100 }],
  },
  {
    id: 'more',
    name: 'Which Has More?',
    emoji: '🍓',
    skill: 'Comparison',
    about: 'Two groups side by side; tap the bigger one.',
    levels: [{ max: 5 }, { max: 8 }, { max: 12 }, { min: 6, max: 15, gap: 2 }, { min: 10, max: 20, gap: 1 }],
  },
  {
    id: 'add',
    name: 'One More Unicorn',
    emoji: '🦄',
    skill: 'Adding on',
    about: 'Some unicorns, then more arrive. How many now?',
    levels: [{ max: 5 }, { max: 8 }, { max: 10 }, { min: 5, max: 15, extraMax: 4, choices: 4 }, { min: 8, max: 20, extraMax: 5, choices: 4 }],
  },
];

export const QUESTIONS_PER_ROUND = 5;

export const gameById = (id: GameId): Game => {
  const game = GAMES.find((g) => g.id === id);
  if (!game) throw new Error(`Unknown game ${id}`);
  return game;
};

export const isGameId = (id: string): id is GameId => GAMES.some((g) => g.id === id);

/** Emoji families; "Which has more?" uses two from the same family so the groups look different. */
export const OBJECT_SETS: readonly (readonly [string, string, string])[] = [
  ['🦋', '🐞', '🐰'],
  ['🌸', '🌷', '🌼'],
  ['🍓', '🍒', '🍎'],
  ['⭐', '💖', '🎀'],
  ['🧁', '🍬', '🍭'],
];
