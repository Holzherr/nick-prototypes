Status: building

# Rounds from the question bank

Goal G-14 (Nick, 26 Sep 2026): at least two new round types. The question bank (`src/features/games/bank/`,
typed in `types.ts`, checked by `validate.ts`) holds 585 checked questions in seven topics: story, pattern,
sequence, double, money, clock and ordinal. Nick asked on 27 Sep that they become new round types, and
answered "yes" on 28 Sep to MG-028's recommendation: one shape for every bank round, pattern and sequence
first (DECISIONS.md). Story items are not a tile: MG-027 mixes them into adding and taking-away rounds.

## One shape for every bank round

**A tile of its own.** Each bank topic is a game in `GAMES` with an id, name, emoji, skill line and `about`
line, like the nine generated games, not a mode inside one. Its id is the topic name.

**Six levels.** Bank `level` 1–6 is the games' own scale (1–3 printable stages, 4–6 challenge, 6 gold). The
game's level at index *i* draws items with `level` = *i* + 1; that level's `max` is the level number, so a
finished round records `levelMax` = level.

**Five questions a round.** Five items of the tile's topic at the tile's level, drawn with the round's rng,
no item twice. A level with fewer than five items gives every item once, then starts again from a fresh
shuffle, never the same item twice in a row (today every pattern and sequence level has six or more). A
question eased after two misses (MG-020) is one item from the level below, as in the other games.

**Options as the item says.** `item.options` are the buttons, in the bank's order and count. `item.show`
says how to draw them: `emoji` as the picture, large; `numeral` as the number, as in every other game;
`pence`, `coin` and `clock` are built with the money and clock tiles.

**The row.** `row` has one gap (`null`), drawn above the buttons as a strip of cards, pictures or numbers as
`show` says; the gap is a dashed card with a `?`, filled with the answer once she has answered. A row of more
than six cards (up to 11 at pattern levels 4–5) uses smaller cards so it stays on one line on a phone.

**Spoken, never read.** `item.say` is spoken through `sound.ts` when the question appears. No sentence is on
screen: above the row is a 🔊 button that says it again. After a miss the game says "Good try! It was *n*."
for a number and "Good try! It's the green one." for a picture. `item.hint` is not spoken yet: the round
moves on after a miss, so a hint has nowhere to land until a "try again" step exists.

**Recorded like the nine games.** A `maths_rounds` row with the new game id and `levelMax` = level; each
answer's `target` is the item id (`pattern-3-07`). No migration: `agent_snapshot` counts rows by `game`, so
a new id is a game type of its own. Levelling applies unchanged.

**On home like any game.** The tile comes from `GAMES`; the suggestion (`recommend.ts`) and the quest
(rounds.md) can offer it. No printable, QR link or learning-path skill row yet.

## The first two

1. **Patterns** (`pattern`, 🔁, skill "Patterns"): levels 1–5 repeating picture rows (AB up to ABCD, gap at
   the end or inside), drawn as `emoji`; level 6 counts on and back in twos, fives and tens, as `numeral`.
2. **Number Track** (`sequence`, 🛤️, skill "Number order"): the number after, before or missing on a track,
   within 5 at level 1 up to 100 crossing tens at level 6, as `numeral`.

They fill the ordering and patterns gaps in the README's "Next". Double, money, clock and ordinal follow as
one item each, once the first two have a week of numbers in the report.
