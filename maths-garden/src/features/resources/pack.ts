import { SKILLS, type SkillId, type StageNumber } from '@/features/curriculum/skills';
import { SHEET_LIST, type SheetId } from './sheets/catalog';

/**
 * The stage pack: every sheet a child needs right now, at the stage they are on, in one print job.
 * Stages travel in the link (`#/resources/pack?subitising=2&counting=1&…`) so it works signed out too.
 */
export interface PackOptions {
  name: string;
  icon: string;
  stages: Record<SkillId, StageNumber>;
}

/** The sheet that teaches each skill; subitising has its own card maker. */
export const SHEET_FOR_SKILL: Partial<Record<SkillId, SheetId>> = Object.fromEntries(SHEET_LIST.map((sheet) => [sheet.skill, sheet.id]));

const asStage = (raw: string | null, fallback: StageNumber): StageNumber => {
  const n = Number(raw);
  return n === 1 || n === 2 || n === 3 ? n : fallback;
};

export function packLink(options: PackOptions): string {
  const params = new URLSearchParams();
  if (options.name) params.set('name', options.name);
  if (options.icon) params.set('icon', options.icon);
  for (const skill of SKILLS) params.set(skill.id, String(options.stages[skill.id]));
  return `#/resources/pack?${params}`;
}

export function packFromParams(params: URLSearchParams): PackOptions {
  const stages = Object.fromEntries(SKILLS.map((skill) => [skill.id, asStage(params.get(skill.id), 1)])) as Record<SkillId, StageNumber>;
  return { name: params.get('name') ?? '', icon: params.get('icon') || '🦄', stages };
}
