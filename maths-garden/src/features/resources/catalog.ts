import type { SkillId, StageNumber } from '@/features/curriculum/skills';
import { SHEET_LIST, sheetLink } from './sheets/catalog';
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

const ALL_STAGES: readonly StageNumber[] = [1, 2, 3];

/** Free printables. One maker screen per family of sheets; every skill and stage has something. */
export const PRINTABLES: readonly Printable[] = [
  {
    id: 'subitising-cards',
    title: 'Quick Peek dot cards',
    skill: 'subitising',
    stages: ALL_STAGES,
    description: 'Flash cards in dice, scattered, row, five/ten-frame and two-group patterns. Add a name and a picture; answers on the back.',
    status: 'ready',
    link: (stage, name) => cardsLink(stage, name),
  },
  ...SHEET_LIST.map(
    (sheet): Printable => ({
      id: sheet.id,
      title: sheet.title,
      skill: sheet.skill,
      stages: ALL_STAGES,
      description: sheet.blurb,
      status: 'ready',
      link: (stage, name) => sheetLink(sheet.id, stage, name),
    }),
  ),
];

export const printablesFor = (skill: SkillId) => PRINTABLES.filter((p) => p.skill === skill);
