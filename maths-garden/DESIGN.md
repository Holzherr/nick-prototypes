---
name: Maths Garden
description: Soft pink, rounded and chunky. Cream "candy" buttons and cards sit on a solid petal or raspberry slab that squashes when pressed. Fredoka throughout, emoji for all illustration, a unicorn tile as the mark.
colors:
  blush: '#ffe9f1'
  petal: '#ffd3e4'
  bubble: '#ff7bac'
  raspberry: '#e0326e'
  cream: '#fffdf9'
  grape: '#6b2d5c'
  sunny: '#ffc94d'
  leaf: '#5fbf8a'
  leaf-deep: '#3d9967'
  clay: '#b3541e'
typography:
  fontFamily: 'Fredoka (self-hosted via @fontsource), ui-rounded, system-ui'
  title: { fontSize: 'clamp(34px, 6vw, 64px)', fontWeight: 700, color: '{colors.raspberry}' }
  prompt: { fontSize: 'clamp(22px, 3.6vw, 36px)', fontWeight: 600 }
  answer: { fontSize: 'clamp(38px, 6vw, 52px)', fontWeight: 700 }
  body: { fontSize: '16–18px' }
rounded:
  card: '36px'
  stage-card: '44px'
  button: '999px'
  icon-tile: '22.5%'
spacing:
  gutter: '16–24px'
  candy-depth: '8–12px'
---

# Maths Garden design

Tokens live in `src/styles/tailwind.css` under `@theme` (`bg-blush`, `text-grape`, `candy-petal`…). Change a
colour there, not in components.

## Principles

- **Candy press.** Every tappable thing has a solid slab under it (`candy-<colour>` + `--candy` depth). On
  press it drops a few pixels and the slab shrinks. Children need to feel the tap land.
- **Big targets.** Answer bubbles are 84–118px circles; tiles are ~200px. Nothing a child taps is smaller
  than 58px.
- **One pink action.** `bubble` fill is the thing to tap; `cream` is secondary; grown-up links are text.
- **Green means right, wobble means try again.** No red, no crosses. A wrong tap wobbles and the right
  answer lights up green.
- **Emoji are the illustration.** Games, stickers and avatars use emoji; the only drawn art is the unicorn
  mark. Stickers are emoji on a pack gradient with a white die-cut edge.
- **Two audiences, one palette.** Child screens are full-bleed and loud; grown-up screens are one cream
  card with small type and plain text links.
- **Paper matches screen.** Printable cards and the Quick Peek game share `features/resources/subitising/patterns.ts`.
  Dots are raspberry, the second group grape (distinct in greyscale too).

## Brand

Unicorn head facing left (cream), gold striped horn, pink/lilac/gold bubble mane, on a bubble→raspberry
gradient tile. Source: `shared/brand/UnicornMark.tsx`; the same drawing is in `public/favicon.svg` and
`tools/icon-square.svg` (rendered to `public/icons/*.png` by `tools/render-icons.sh`).

## Motion

`animate-drift` (background emoji), `animate-pop-in` (new objects, stickers), `animate-bounce-once` (right),
`animate-wobble` (wrong), `animate-fly` (celebration burst). All decorative motion is off under
`prefers-reduced-motion`.

## Print

A4 pages (`@page { size: A4; margin: 0 }`, 10mm inner margin). Cards are 100 × 72 SVG units, drawn with
pink cut lines. The preview zooms down on narrow screens only (`.sheet-preview`).
