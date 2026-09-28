import { say } from '@/features/games/sound';
import { cn } from '@/shared/utils/cn';
import type { Character } from '../characters';
import { justGrew, stageOf } from '../stage';

/** `rounds` is finished rounds so far and decides her stage; `size` is her width in px, she stands 1.2× as tall. */
export interface CharacterSlotProps {
  character: Character;
  rounds: number;
  childName: string;
  size?: number;
  className?: string;
}

/**
 * The character at the stage her rounds have earned, as one big tap target and nothing to read: tapping
 * her speaks her line for that stage with the child's name. The round that lifts her a stage pops her in.
 * Any entry of the character list renders here; the slot knows nothing about Nova.
 */
export function CharacterSlot({ character, rounds, childName, size = 112, className }: CharacterSlotProps) {
  const stage = stageOf(character, rounds);
  return (
    <button
      type="button"
      aria-label={character.name}
      onClick={() => say(character.lines[stage - 1](childName))}
      className={cn('inline-flex origin-bottom leading-none transition-transform active:scale-95', justGrew(character, rounds) && 'animate-pop-in', className)}
    >
      <character.Art stage={stage} size={size} />
    </button>
  );
}
