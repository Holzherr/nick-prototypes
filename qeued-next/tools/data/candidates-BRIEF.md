# Qeued catalogue candidate list

Qeued (qeued.com) is a watchlist app with its own catalogue, built by reading JustWatch UK
pages. It holds 653 titles and is growing to several thousand. You are producing candidates
for one slice of that expansion.

## Your slice
Given in your task message. Stay inside it — other agents are covering the rest, and overlap
is wasted work.

## What to produce
A JSON array. One object per title:

```json
{ "name": "Do the Right Thing", "year": 1989, "type": "movie", "priority": 5, "bucket": "us-1980s", "why": "Spike Lee's block-party summer; Palme nominee" }
```

- `name` — the title as it is commonly known in the UK. English title where one is standard
  (Cinema Paradiso, not Nuovo Cinema Paradiso); original title where that is what people say
  (Amélie, Parasite, Oldboy).
- `year` — first release or first broadcast. For a series, the year it started.
- `type` — `"movie"` or `"series"`.
- `priority` — 1 to 5, using the rubric below. Be honest; a list of all 5s is useless for
  ranking.
- `bucket` — the short slug given in your task message.
- `why` — at most twelve words. What it is or why it earns a place.

## Priority rubric
- **5** — canonical. A major award winner, a landmark, or a title most viewers would
  recognise as important. If it is missing, the catalogue looks incomplete.
- **4** — strongly acclaimed or widely watched. A confident recommendation.
- **3** — good, worth having, unlikely to be anyone's first pick.
- **2** — niche but distinctive. Earns a place because it is unlike what is already held.
- **1** — completionist. Include sparingly.

Aim for a spread: roughly 20% at 5, 35% at 4, 30% at 3, 15% at 2 or 1.

## Rules
- **Real titles only.** Never invent one. If you are unsure a title exists, or unsure of its
  year, leave it out or check with WebSearch.
- **Plausibly available in the UK** — on a major service (Netflix, Prime Video, Disney+, NOW,
  BBC iPlayer, ITVX, Channel 4, Apple TV+, Paramount+, MUBI, BFI Player) or buyable/rentable
  there. Do not propose US-only or unavailable titles.
- **Not already held.** `/private/tmp/claude-501/qeued-expand/ALREADY-HELD.txt` lists all 653
  current titles as `Name (Year) [F|S]`. Read it and exclude anything on it. Do not spend
  effort re-checking beyond that file.
- **No stand-up specials, no panel shows, no daytime formats, no news, no children's
  pre-school programming.** Family films and children's animation with adult appeal are fine.
- Spread the years across your slice rather than clustering on one decade.
- Do not pad with sequels and franchise entries unless the individual entry is genuinely
  notable in its own right.

## How much
Your task message gives a target count. Get as close as you can with real titles you are
confident about. It is better to return 120 solid entries than 200 with twenty inventions.

## Output
Write ONE JSON array to the output path you are given. No markdown fence, no commentary in
the file. Then reply with: the count, the spread across priorities, and anything you could
not fill.
