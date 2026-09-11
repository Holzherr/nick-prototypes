/** The five games, the skill each one trains, and the biggest number used at each level. */
export type GameId = 'peek' | 'count' | 'find' | 'more' | 'add';

export interface Game {
  id: GameId;
  name: string;
  emoji: string;
  skill: string;
  /** One line for the grown-ups screen. */
  about: string;
  /** Largest number used at each level; level index 0 is the easiest. */
  levels: readonly number[];
}

export const GAMES: readonly Game[] = [
  { id: 'peek', name: 'Quick Peek', emoji: '👀', skill: 'Subitising', about: 'Dots show for 2 seconds, then hide. Say how many without counting.', levels: [3, 5, 10] },
  { id: 'count', name: 'Count With Me', emoji: '🦋', skill: 'Counting objects', about: 'Tap each object once while counting, then pick the total.', levels: [5, 8, 12] },
  { id: 'find', name: 'Find the Number', emoji: '🔢', skill: 'Numeral recognition', about: 'Hears a number and taps the matching numeral.', levels: [5, 10, 20] },
  { id: 'more', name: 'Which Has More?', emoji: '🍓', skill: 'Comparison', about: 'Two groups side by side; tap the bigger one.', levels: [5, 8, 12] },
  { id: 'add', name: 'One More Unicorn', emoji: '🦄', skill: 'Adding on', about: 'Some unicorns, then 1–3 more arrive. How many now?', levels: [5, 8, 10] },
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
