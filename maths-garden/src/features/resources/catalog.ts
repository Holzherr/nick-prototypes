import type { SkillId, StageNumber } from '@/features/curriculum/skills';
import { cardsLink } from './subitising/cards';

export interface Printable {
  id: string;
  title: string;
  skill: SkillId;
  stages: readonly StageNumber[];
  description: string;
  status: 'ready' | 'planned';
  /** For ready printables: link for a stage, optionally personalised. */
  link?: (stage: StageNumber, name?: string) => string;
}

/** Free printables, ready and planned. The full list to build comes from the provider research work plan. */
export const PRINTABLES: readonly Printable[] = [
  {
    id: 'subitising-cards',
    title: 'Quick Peek dot cards',
    skill: 'subitising',
    stages: [1, 2, 3],
    description: 'Flash cards in dice, scattered, row, five/ten-frame and two-group patterns. Add a name and a picture; answers on the back.',
    status: 'ready',
    link: (stage, name) => cardsLink(stage, name),
  },
  { id: 'counting-mats', title: 'Counting mats', skill: 'counting', stages: [1, 2, 3], description: 'Put one object on each spot, then say how many.', status: 'planned' },
  { id: 'numeral-cards', title: 'Numeral cards and number hunt', skill: 'numerals', stages: [1, 2, 3], description: 'Big numerals to find around the house.', status: 'planned' },
  { id: 'more-or-fewer', title: 'More or fewer? cards', skill: 'comparison', stages: [1, 2, 3], description: 'Pairs of groups to compare, with a “same” card.', status: 'planned' },
  { id: 'unicorn-stories', title: 'One more unicorn story board', skill: 'adding', stages: [1, 2, 3], description: 'A field board and counters for “one more” stories.', status: 'planned' },
  { id: 'number-track', title: 'Number track race', skill: 'rote', stages: [1, 2, 3], description: 'Roll, move and say the numbers along a track to 10, 20 or 30.', status: 'planned' },
];

export const printablesFor = (skill: SkillId) => PRINTABLES.filter((p) => p.skill === skill);
