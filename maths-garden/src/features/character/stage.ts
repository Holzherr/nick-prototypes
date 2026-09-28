import type { Character, Stage } from './characters';

/**
 * The stage a character has reached after this many finished rounds. Rounds finished only ever grows, so
 * the stage never falls; a child with no rounds meets her at stage 1.
 */
export function stageOf(character: Character, rounds: number): Stage {
  let stage = 1;
  for (const at of character.stagesAt) if (rounds >= at) stage++;
  return stage as Stage;
}

export const TOP_STAGE: Stage = 5;

/** True when the round just finished is the one that lifted her a stage. */
export const justGrew = (character: Character, rounds: number) => rounds > 0 && stageOf(character, rounds) !== stageOf(character, rounds - 1);
