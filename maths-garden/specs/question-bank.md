Status: building

# Rounds from the question bank

Goal G-14 (Nick, 26 Sep 2026): the maths keeps stretching Tara with new kinds of rounds, at least two new
round types. The question bank (`src/features/games/bank/question-bank.json`, typed in `bank/types.ts`,
checked by `bank/validate.ts`) holds 585 fixed, checked questions in seven topics: story, pattern, sequence,
double, money, clock and ordinal. Nick asked on 27 Sep that they become new round types (inbox, board), and
answered "yes" on 28 Sep to the recommendation on MG-028: one shape for every bank round, pattern and
sequence first (DECISIONS.md). Story items are not a tile: they are mixed into adding and taking-away rounds
by their own item (MG-027) and get their own section here when it is built.

## One shape for every bank round

**A tile of its own.** Each bank topic is a game in `GAMES` with an id, name, emoji, skill line and `about`
line, exactly like the nine generated games. It is not a mode inside an existing game. Its id is the topic
name (`pattern`, `sequence`), so the topic a game draws from is its id.

**Six levels.** Bank items carry `level` 1–6, the games' own scale: 1–3 the printable stages, 4–6 the
challenge levels, 6 the gold one. The game's level at index *i* draws items with `level` = *i* + 1, and that
level's `max` is the level number, so a finished round records `levelMax` = level.

**Five questions a round.** A round is five items of the tile's topic at the tile's level, drawn at random
with the round's rng. No item appears twice in a round. A level with fewer than five items gives every item
once, then starts again from a fresh shuffle, never asking the same item twice in a row. Every level of
pattern and sequence holds at least six items today, so this is a guard, not the usual case. A question
eased after two misses (levelling, MG-020) is one item from the level below, as in the other games.

**Options as the item says.** `item.options` are the answer buttons, in the order the bank gives them
(already shuffled, and already the level's count: three at levels 1–3, four at 4–5, five at 6). `item.show`
says how to draw them:

- `emoji`: each button is the picture, large.
- `numeral`: each button is the number, as in every other game.
- `pence`, `coin`, `clock`: named for the later topics (money, clock) and built with them.

**The row.** Pattern and sequence items carry a `row` with one gap (`null`). It is drawn above the buttons
as a strip of cards, pictures or numbers as `show` says, and the gap is a card with a large `?`. A long row
(up to 11 cards at pattern levels 4–5) wraps rather than shrinking past what a four-year-old can see.

**Spoken, never read.** `item.say` is spoken through `sound.ts` when the question appears. There is no
sentence on screen for the child: the line above the row is a 🔊 button that says it again. Numbers in the
row and on buttons are the maths itself, not text to read. After a wrong answer the game says "Good try! It
was *n*." for a number, and "Good try! It's the green one." for a picture, as the right button turns green.
`item.hint` is not spoken yet: the round moves on after a miss, so a hint has nowhere to land until a
"try again" step exists.

**Recorded like the nine games.** A finished round is a `maths_rounds` row with the new game id and
`levelMax` = level; each answer's `target` is the item id (`pattern-3-07`), which is stable and never reused.
No migration: `game` is free text and `agent_snapshot` counts rows by it, so a new id counts as a game type of
its own. Levelling (MG-020) applies unchanged.

**On home like any game.** The tile appears on home from `GAMES`, home's suggestion (`recommend.ts`) can
offer it, and a quest (rounds.md) can draw from it. No printable and no QR link yet, and no skill row on the
learning path: a bank topic has no printable stages to unlock.

## The first two

1. **Pattern** (🔁, "Patterns"): levels 1–5 are repeating picture patterns (AB up to ABCC, gap at the end or
   inside), drawn as `emoji`; level 6 counts on and back in twos, fives and tens to 100, drawn as `numeral`.
2. **Sequence** (🛤️, "Number order"): a number track with one gap — the number after, the number before, a
   missing one — within 5 at level 1 up to 100 crossing tens at level 6, drawn as `numeral`.

They fill the ordering and patterns gaps the README's "Next" names. Double, money, clock and ordinal follow
as one item each, once the first two have a week of numbers in the report.
