# qeued list curation brief

qeued is a watchlist app with its own catalogue — around 4,300 titles, each with a synopsis
written for qeued, verified poster art and UK availability. You are writing the browsing
lists: the catalogue arranged by judgement rather than by a query.

## Why these are not a Top 250

IMDb ranks by an aggregated user score. qeued has no users to aggregate and will not import
somebody else's score, so a numbered leaderboard here would be a borrowed opinion wearing a
number. These lists are editorial instead. Each one is a position somebody took, in an order
that means something, with a line saying why each title earned its place.

That is the harder and better product. Write like a person who has seen the films.

## Your input

A JSON file of titles you may choose from. Each has: `slug`, `name`, `year`, `type`,
`genres`, `tones`, `themes`, `countries`, `director`.

**You may only use slugs from your input file.** A slug that is not in the catalogue is
dropped on import, and a list that loses its entries is not published.

## What to produce

One JSON array of lists. Each list:

```json
{
  "slug": "best-of-1999",
  "name": "The best of 1999",
  "kind": "year",
  "facet": "1999",
  "blurb": "The year the studios lost their nerve and let everybody make something strange.",
  "position": 30,
  "entries": [
    { "slug": "the-matrix-1999", "note": "Action cinema rebuilt around one idea, executed once and never bettered." }
  ]
}
```

- `slug` — kebab-case, unique, stable. It becomes the page's address.
- `name` — what the list is called. Title case, no colon-explainer.
- `kind` — one of `year`, `decade`, `genre`, `place`, `pick`.
- `facet` — what it is of: `"1999"`, `"1990s"`, `"Horror"`, `"South Korea"`. Null for `pick`.
- `blurb` — one sentence, at most 20 words, in the house voice: dry, specific, a position
  rather than a summary. No "dive into", no "something for everyone", no exclamation marks.
- `position` — lower sorts first on the index.
- `entries` — **in order**, best first. The order is the whole point.
- `note` — at most 18 words on why this one earned its place, or what it is. A list of bare
  names says very little. Vary the construction; do not start three notes the same way.

## Rules

- **Order honestly.** Put the best first and mean it. A list where the order is arbitrary is
  worse than no list.
- **Between 10 and 25 entries** per list unless told otherwise. A long list is not a better
  one.
- **No padding.** If a year or a genre does not have fifteen titles worth ranking in the
  catalogue, write a shorter list.
- **British spelling.** No "iconic", "masterpiece", "must-watch", "tour de force".
- **Don't repeat yourself across lists.** A title may appear on several, but its note should
  say something different each time.
- Films and series may share a list unless the task says otherwise.

## Output

Write ONE JSON array to the path you are given. No markdown fence, no commentary in the
file. Then reply with: the lists written, their lengths, and anything you could not fill.
