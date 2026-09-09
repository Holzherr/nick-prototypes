---
name: Strawberry
description: Black ink on white, Inter, generous space, mobile-first. No colour anywhere except the strawberry mark — a red fruit on an otherwise greyscale app.
colors:
  strawberry: '#e11d48'
  strawberry-leaf: '#0f0f0f'
  ink: '#0a0a0a'
  body: '#171717'
  muted: '#737373'
  line: '#e5e5e5'
  well: '#f5f5f5'
  surface: '#ffffff'
  canvas: '#ffffff'
  danger: '#ef4444'
typography:
  family: "'Inter', system-ui, -apple-system, sans-serif"
  title:
    fontSize: '24px'
    fontWeight: 600
    letterSpacing: '-0.02em'
  section:
    fontSize: '15px'
    fontWeight: 600
  body:
    fontSize: '14px'
  label:
    fontSize: '12px'
    color: '{colors.muted}'
rounded:
  card: '8px'
  control: '8px'
  pill: '999px'
---

# Strawberry design

Black and white only. The strawberry mark is the single piece of colour in the product — it appears
in the logo, the favicon and the app icon, and nowhere else. A coloured button, a coloured chip or a
coloured chart would break the whole idea, so tokens are greyscale by construction: the `:root`
block in `src/styles/tailwind.css` has no hue on any surface, text or border token, and the mark
carries its own fill inside `shared/brand`.

Type is Inter, loaded from Google Fonts, with a system stack behind it. Layout is mobile-first: a
bottom tab bar on phones, a top nav from `md` up, and generous whitespace at every size.

Tokens are hsl triplets under `:root` and mapped into Tailwind 4 through `@theme inline`, so class
names ported from the Lovable export (`bg-background`, `text-muted-foreground`, `border-border`)
resolve unchanged.
