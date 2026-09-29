Status: building

# New kinds of round

Goal G-14 (Nick, 26 Sep 2026): the maths keeps stretching Tara with new kinds of rounds, at least two new round
types. Today every round is five questions from one game at one level. A round type here is a new **shape of
round across the existing games**, not a new game: no new generator, no new levels, no new art. Written from
the recommendation on MG-025, which Nick answered "yes" on 28 Sep 2026 (DECISIONS.md).

## The two round types

1. **Quest round** (this spec's first slice, MG-025): five questions drawn from the child's three weakest
   skills, using those games' existing generators at each game's current level.
2. **Ordering round**: waits until the quest round has a week of numbers in the report, then gets its own
   item and its own section here.

## Quest round

**Who gets one.** A child with finished rounds in three or more games. With fewer, there is no quest: home
offers a game as it does today.

**The three weakest.** Accuracy per game over its last three finished rounds (`skillStats`, the same window
the grown-ups screen shows). The three lowest lead; a tie goes to the game earlier in the catalogue, which
is the order the skills are learnt.

**The five questions.** Slots go weakest, second, third, weakest, second: two from each of the two weakest,
one from the third. Each game's questions come from its own generator at its current level, with the same
no-repeat rule a round of that game has. After two misses in a row the next question is eased from its own
game's level below, as in a round of that game.

**Scoring.** Every answer counts to its own game. A finished quest writes **one round row per source game**
(`maths_rounds`, `game` = that game, `level` = that game's level when the quest was drawn, `levelMax` from
that level, `completed` true, all rows sharing one `playedAt`), so `agent_snapshot` counts the quest under
each game with no migration. The quest itself moves no level: its rows are one or two answers each, and
levels are earned, dropped and mastered on **full rounds only** (`total` at least five, `engine.ts`), so a
quest row is neither a round of a streak nor a break in it, and one right answer at a game's top level is
not a mastery. The rows do count in the grown-ups' accuracy and often-missed views, which is how the next
quest sees whether a skill is still weak. A quest left part-way and then given up for another game writes
the same rows with `completed` false, as a round does. Because the rows are ordinary rounds, a quest
counts towards the daily goal, the garden and the break nudge as one round per game it touched, and the
end screen's "daily goal done" line fires when the quest carries the day past the goal, not only when it
lands on it exactly; a marker column would fix the counting and is a migration, so it is left for Nick.

**Where home offers it.** In place of the suggested game, through `recommend.ts`: the lead tile is the quest
(🗺️ "Quest") when three or more games have been played, no game is still unplayed (a new game wins
outright, as today), and no quest has been finished today. Every game stays behind "Or pick another game".
After the day's quest, home suggests a game again. Starting it from home counts as `offer_taken`; a game
picked instead counts as `offer_skipped`.

**Not in the quest round.** No printable and no QR link. No tenth tile. No new strings in the language
catalogues: the quest's name and reason are English, like the wind-down lines.
