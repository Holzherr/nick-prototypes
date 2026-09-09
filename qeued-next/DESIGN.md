---
name: Qeued
description: Clean, near-white app with one blue for actions and a pink→purple→blue gradient Q as the mark. shadcn/Radix shapes — 12px radius, 1px hairlines, soft shadows — kept from the Lovable build.
colors:
  primary: '#3b82f6'
  primary-foreground: '#ffffff'
  background: '#fcfcfc'
  foreground: '#14171f'
  card: '#ffffff'
  secondary: '#f3f4f6'
  muted: '#f3f4f6'
  muted-foreground: '#6b7280'
  border: '#e5e7eb'
  destructive: '#ef4444'
  gradient-from: '#ec4899'
  gradient-via: '#a855f7'
  gradient-to: '#3b82f6'
typography:
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  hero:
    fontSize: '48px'
    fontWeight: 700
    lineHeight: 1.1
  h1:
    fontSize: '30px'
    fontWeight: 700
  card-title:
    fontSize: '16px'
    fontWeight: 600
  body:
    fontSize: '14px'
  meta:
    fontSize: '12px'
    color: '{colors.muted-foreground}'
rounded:
  lg: '12px'
  md: '10px'
  sm: '8px'
  tile: '8px'
  pill: '999px'
spacing:
  page-x: '16px'
  page-max: '1024px'
  header-h: '56px'
  section-gap: '24px'
---

# Qeued design tokens

Tokens live in `src/styles/tailwind.css` as the shadcn hsl variables (`--primary: 217 91% 60%`)
mapped into Tailwind 4 with `@theme inline`, so the class names the Lovable build used
(`bg-primary`, `text-muted-foreground`, `border-border`) keep resolving. Change a colour there,
not in components.

## Principles

- **One blue.** `primary` is the only saturated colour on a screen; it marks the single action
  that matters (Get started, Get recommendations, Sign in). Everything else is ink on white.
- **The gradient is the mark, not the palette.** Pink→purple→blue appears only on the Q tile
  (`shared/brand/AppIcon`) and the hero's second line.
- **Cards carry the content.** Titles, entries and recommendations are `Card`s: white, 1px
  `border`, 12px radius, poster or star placeholder left, text right, genre `Badge`s below.
- **Status is a select, not a button row.** "Add to…" is one `Select` with four statuses; once
  chosen it collapses to an outline badge.
- **Mobile first.** 56px sticky header; on phones the nav moves to a fixed bottom tab bar
  (`shared/layout/Layout`) and pages leave 80px bottom padding for it. Inputs stay 16px so iOS
  does not zoom.

## Dark mode

The Lovable build shipped a `.dark` variable set. It is not wired up (no toggle, no
`prefers-color-scheme` hook) and the app is light only for now. If it comes back, add the
`.dark` block to `tailwind.css` under the same variable names.
