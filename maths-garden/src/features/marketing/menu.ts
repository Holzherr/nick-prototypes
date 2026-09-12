import { SKILLS } from '@/features/curriculum/skills';
import { printablesFor } from '@/features/resources/catalog';

/** Every ready printable, grouped by the skill it teaches: the header menu, the footer and the homepage all use it. */
export const RESOURCE_MENU = SKILLS.map((skill) => ({
  skill,
  printables: printablesFor(skill.id).filter((p) => p.status === 'ready' && p.link),
})).filter((group) => group.printables.length > 0);
