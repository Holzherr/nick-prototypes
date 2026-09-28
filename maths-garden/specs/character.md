Status: agreed

# A character that grows as she plays

Goal: G-14 (Nick, 26 Sep 2026) — an original character grows as Tara plays. Today only the garden changes
with her; Nova is a name in the milestone lines and nothing else.

## Decision (Nick, 28 Sep 2026)

Nova is the character, for now. She is original: a pop-star girl with purple hair and a star clip, drawn in
this repo as SVG, no film or brand character, no paid image generation. She is built as the first entry of
a **character list**, not as the only character: over time children will choose or switch between
characters, so a second one is data plus a profile field later. Nothing renders Nova by name.

## What grows

- **Input:** finished rounds, the count the garden already uses (`gardenOf(progress).rounds`). Derived from
  the round log, so she reads the same on every device and needs no migration.
- **Five stages.** Nova: stage 2 at 5 rounds, 3 at 15, 4 at 40, 5 at 80. The thresholds belong to the
  character (`stagesAt`), so a second character can grow at its own pace.
- A stage never falls. Rounds finished only ever grows, and the function is monotone in it.

## Where she is

- **Home**, standing beside the garden strip at the bottom right, every visit.
- **The end screen**, above the stars, so she is there when a round finishes; the round that lifts her a
  stage pops her in.
- The milestone pop-up keeps its lines; each milestone now names the character who hands it out, so the
  pop-up can show her stage art later.

## What she says

Nothing a child has to read: the slot is a picture and a tap target, no caption. Tapping her speaks one
line for her stage through `features/games/sound.ts` (`say`), with the child's name. Lines are data on the
character, keyed by stage.

## Structure

`src/features/character/`:

- `characters.ts` — `CharacterId`, `Character` (id, name, `stagesAt`, `lines`, `Art`), `CHARACTERS` with
  Nova as its only entry, `characterFor(child)` reading an optional `character` field so a profile field
  later needs no other change.
- `stage.ts` — `stageOf(character, rounds)`, tested: rises with rounds, never falls, stage 1 at 0 rounds.
- `art/Nova.tsx` — the five stages as one SVG drawing with layers added per stage.
- `components/CharacterSlot.tsx` — the tappable picture; the same slot renders any entry of the list.

Stories: `Character/Stage 1` … `Stage 5`; `Screens/Game` home and end stories show her at stage 1 and at
the top stage.

## Open, for later items

- Lines and moods: she speaks unprompted at the growth moment and reacts to a round.
- Choosing a character: a profile field and a picker; a second character in the list.
- The milestone pop-up shows the stage art of the character on the milestone instead of the emoji avatar.
