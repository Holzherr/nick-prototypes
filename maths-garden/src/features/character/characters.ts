import type { ReactElement } from 'react';
import { Nova } from './art/Nova';

export type CharacterId = 'nova';

/** How far along a character is: 1 when the child starts, one more at each of `stagesAt`. */
export type Stage = 1 | 2 | 3 | 4 | 5;

/**
 * A character that grows as the child plays. Everything that makes one — the drawing, when it grows and
 * what it says — is data here, so a second one is another entry and nothing on a screen changes.
 */
export interface Character {
  id: CharacterId;
  name: string;
  /** Finished rounds at which stages 2, 3, 4 and 5 begin. */
  stagesAt: readonly [number, number, number, number];
  /** What she says when tapped, one per stage, spoken and never shown. */
  lines: readonly [Line, Line, Line, Line, Line];
  Art: (props: { stage: Stage; size: number }) => ReactElement;
}

type Line = (childName: string) => string;

/**
 * Nova, an original pop-star girl: purple bob, a star clip, a lilac dress. She already hands out the gold
 * stickers at milestones, so she is the first to grow: a microphone, then sparkles and headphones, then a
 * stage under a spotlight, then a tiara and a shower of stars.
 */
const NOVA: Character = {
  id: 'nova',
  name: 'Nova',
  stagesAt: [5, 15, 40, 80],
  lines: [
    (name) => `Hi ${name}! I'm Nova. Play with me and watch me grow!`,
    (name) => `Look, ${name}! I've got a microphone now!`,
    (name) => `${name}, I'm getting sparkly! Keep playing!`,
    (name) => `Wow, ${name}! I'm on stage now!`,
    (name) => `${name}, you made me a star! Thank you!`,
  ],
  Art: Nova,
};

/** Every character a child could have, in the order a picker would offer them. */
export const CHARACTERS: readonly Character[] = [NOVA];
export const characterById = (id: CharacterId) => CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
/** The child's character: the one on her profile once profiles carry one, the first of the list until then. */
export const characterFor = (child: { id: string; character?: CharacterId }) => characterById(child.character ?? CHARACTERS[0].id);
