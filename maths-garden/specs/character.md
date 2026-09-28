Status: building

# A character that grows as she plays

Goal: G-14 (Nick, 26 Sep 2026). Today only the garden changes with her; Nova is a name in the milestone
lines and nothing else.

**Decision (Nick, 28 Sep 2026):** Nova is the character, for now. She is original: a pop-star girl with
purple hair and a star clip, drawn in this repo as SVG, no film or brand character, no paid image
generation. She is the first entry of a **character list**, not a special case: children will choose or
switch characters later, so a second one is data plus a profile field. Nothing renders Nova by name.

## What grows

- **Input:** finished rounds, the count the garden already uses (`gardenOf(progress).rounds`). Derived from
  the round log, so she reads the same on every device and needs no migration.
- **Five stages.** Nova: stage 2 at 5 rounds, 3 at 15, 4 at 40, 5 at 80. Thresholds belong to the
  character (`stagesAt`), so another character can grow at its own pace.
- A stage never falls: rounds finished only ever grows, and the function is monotone in it.

## Where she is, what she says

- **Home**, standing beside the garden strip at the bottom right, every visit.
- **The end screen**, above the stars; the round that lifts her a stage pops her in.
- Each milestone names the character who hands it out, so the pop-up can show her stage art later.
- Nothing a child has to read: the slot is a picture and a tap target. Tapping her speaks one line for her
  stage through `features/games/sound.ts`, with the child's name. Lines are data on the character.

Code lives in `src/features/character/` (the list, `stageOf`, the art, the slot); the README describes it.

## Open, for later items

- Lines and moods: she speaks unprompted at the growth moment and reacts to a round.
- Choosing a character: a profile field, a picker, a second entry in the list.
- The milestone pop-up shows the stage art of the milestone's character instead of the emoji avatar.
