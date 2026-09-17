/**
 * The icon a child picks on the way in, and the palette that comes with it.
 *
 * The app shipped pink, which reads as "for girls" to plenty of five-year-old boys — and to their
 * parents scanning a link. Picking a rocket or a dragon repaints the whole app, so the same maths
 * arrives in a colour the child chose. `plain` is the un-chosen state: ink on paper, no signal either
 * way, which is what a first-time visitor sees before they touch anything.
 *
 * Each theme overrides the five palette tokens that carry the brand. leaf/sunny/clay stay put: they
 * mean correct, star and warning everywhere in the app, and a theme that moved them would change what
 * a colour means rather than how it looks.
 */
export interface Theme {
  id: ThemeId;
  /** What the chooser calls it. */
  label: string;
  /** The mark itself. `unicorn` draws UnicornMark instead; everything else is this glyph. */
  glyph: string;
  /** Faint shapes drifting up behind every screen (FloatingHearts). Pink unicorns under a dragon theme
      undo the point of picking one, so the background changes with the palette. */
  drift: readonly [string, string, string, string];
  colors: {
    /** Page background. */
    blush: string;
    /** Tinted panels and dashed rules. */
    petal: string;
    /** Mid accent: tile gradient start, "n min read", open markers. */
    bubble: string;
    /** Strong accent: headings, primary buttons, links. */
    raspberry: string;
    /** Body text. */
    grape: string;
  };
}

export const THEMES = [
  {
    id: 'plain',
    label: 'Plain',
    glyph: '✏️',
    drift: ['✏️', '📘', '⭐', '🔢'],
    colors: { blush: '#f4f2ee', petal: '#e0dcd4', bubble: '#6f6a61', raspberry: '#1c1b18', grape: '#33302b' },
  },
  {
    id: 'unicorn',
    label: 'Unicorn',
    glyph: '🦄',
    drift: ['💗', '🌸', '⭐', '🦄'],
    colors: { blush: '#ffe9f1', petal: '#ffd3e4', bubble: '#ff7bac', raspberry: '#e0326e', grape: '#6b2d5c' },
  },
  {
    id: 'car',
    label: 'Racing car',
    glyph: '🏎️',
    drift: ['🏎️', '🏁', '⭐', '🔧'],
    colors: { blush: '#e7f1ff', petal: '#c8e0ff', bubble: '#4a93e8', raspberry: '#1157b8', grape: '#153560' },
  },
  {
    id: 'dragon',
    label: 'Dragon',
    glyph: '🐉',
    drift: ['🐉', '🔥', '⭐', '🏰'],
    colors: { blush: '#e6f6ea', petal: '#c3ead0', bubble: '#44ae6c', raspberry: '#137c43', grape: '#123f29' },
  },
  {
    id: 'rocket',
    label: 'Rocket',
    glyph: '🚀',
    drift: ['🚀', '🪐', '⭐', '🛸'],
    colors: { blush: '#eeeaff', petal: '#d7cfff', bubble: '#8670ee', raspberry: '#5230c6', grape: '#2b1c60' },
  },
  {
    id: 'dinosaur',
    label: 'Dinosaur',
    glyph: '🦕',
    drift: ['🦕', '🌿', '⭐', '🥚'],
    colors: { blush: '#e6f5f4', petal: '#c2e7e4', bubble: '#3aa8a0', raspberry: '#0f7871', grape: '#103c3a' },
  },
  {
    id: 'cat',
    label: 'Cat',
    glyph: '🐱',
    drift: ['🐱', '🐾', '⭐', '🧶'],
    colors: { blush: '#fff0e2', petal: '#ffdbbd', bubble: '#f28c3c', raspberry: '#c5540d', grape: '#5a2f12' },
  },
  {
    id: 'football',
    label: 'Football',
    glyph: '⚽️',
    drift: ['⚽️', '🥅', '⭐', '🏆'],
    colors: { blush: '#eef3ee', petal: '#cfe0d1', bubble: '#5c8f63', raspberry: '#1f5c2b', grape: '#1b3320' },
  },
] as const satisfies readonly Theme[];

export type ThemeId = 'plain' | 'unicorn' | 'car' | 'dragon' | 'rocket' | 'dinosaur' | 'cat' | 'football';

export const DEFAULT_THEME: ThemeId = 'plain';

export const themeById = (id: string | null | undefined): Theme => THEMES.find((t) => t.id === id) ?? THEMES[0];

/**
 * Repaint the app by rewriting the palette custom properties on <html>.
 *
 * Tailwind v4 compiles `@theme` tokens to `--color-*` custom properties, so every `bg-blush` and
 * `text-raspberry` already in the app reads through these — no component knows a theme exists.
 * Also moves the browser chrome colour, which is the strip an installed iPad app shows above the page.
 */
export function applyTheme(id: ThemeId, root: HTMLElement = document.documentElement) {
  const { colors } = themeById(id);
  for (const [token, value] of Object.entries(colors)) root.style.setProperty(`--color-${token}`, value);
  root.dataset.theme = id;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors.blush);
}
