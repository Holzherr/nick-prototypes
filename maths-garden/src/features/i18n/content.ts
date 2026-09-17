import type { GameId } from '@/features/games/catalog';
import type { SkillId } from '@/features/curriculum/skills';
import { translate } from './i18n';

/**
 * Names and descriptions for the things the app is *about* — the games, the skills, the printables.
 *
 * These were plain English fields on the catalogue objects, read directly by a dozen components, a tutor
 * report and every printed sheet. A French family got a French homepage and then played "Quick Peek".
 * Keeping the catalogues as data and looking the words up here means one game has one name everywhere,
 * in whatever language is on, including on paper — a sheet that says a different name from the tile is
 * worse than either language alone, because the QR code on it is an instruction to go and find that name.
 *
 * `translate` rather than `useT` so these work in the printable renderers, which are not hooks.
 */
export const gameName = (id: GameId) => translate(`game.${id}.name`);
export const gameAbout = (id: GameId) => translate(`game.${id}.about`);
export const skillName = (id: SkillId) => translate(`skill.${id}.name`);
export const printableTitle = (id: string) => translate(`printable.${id}.title` as never);
export const printableDescription = (id: string) => translate(`printable.${id}.description` as never);

/** FAQ entries are keyed by position, because the order of the list is the contract. */
export const faqQuestion = (i: number) => translate(`faq.${i}.question` as never);
export const faqAnswer = (i: number) => translate(`faq.${i}.answer` as never);
