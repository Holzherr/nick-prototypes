import type { SkillId } from '@/features/curriculum/skills';
import type { GameId } from '@/features/games/catalog';
import type { Stage } from '../subitising/cards';

/**
 * The printable sheets beyond the Quick Peek cards. One maker screen renders them all
 * (`#/resources/sheet?id=…&stage=…&name=…&icon=…`), so a new sheet is a component plus an entry here.
 */
export type SheetId = 'counting-mats' | 'numeral-cards' | 'more-or-fewer' | 'unicorn-stories' | 'number-track';

export interface SheetStage {
  /** Numbers the sheet covers at this stage. */
  label: string;
  goal: string;
  /** Biggest number printed. */
  to: number;
  from: number;
}

export interface SheetMeta {
  id: SheetId;
  title: string;
  skill: SkillId;
  /** The game that checks the same skill; the QR code on the sheet opens it. */
  game: GameId | null;
  blurb: string;
  /** What to do with it, printed on the sheet. */
  how: readonly string[];
  stages: Record<Stage, SheetStage>;
}

export const SHEETS: Record<SheetId, SheetMeta> = {
  'counting-mats': {
    id: 'counting-mats',
    title: 'Counting mats',
    skill: 'counting',
    game: 'count',
    blurb: 'Put one object on each spot, touch and count, then say how many altogether.',
    how: [
      'Put one button, grape or pasta piece on each spot — one object, one number word.',
      'Touch each one as you count. The last number you say is how many there are.',
      'Then ask for a number: “can you give me 4?” — counting out is harder than counting up.',
    ],
    stages: {
      1: { label: '1–5', goal: 'One object per spot, one number per touch.', from: 1, to: 5 },
      2: { label: '1–8', goal: 'Keeps track in a messy group.', from: 1, to: 8 },
      3: { label: '1–12', goal: 'Counts past ten and counts out a number asked for.', from: 1, to: 12 },
    },
  },
  'numeral-cards': {
    id: 'numeral-cards',
    title: 'Numeral cards, tracing and a number hunt',
    skill: 'numerals',
    game: 'find',
    blurb: 'Big numerals with their dots, dotted numbers to trace, and a hunt for numbers around the house.',
    how: [
      'Lay the cards face up and say the numbers together. Then hide one: “which one is missing?”',
      'Trace the dotted numbers with a finger first, then a pencil, saying the number as you go.',
      'Take the hunt sheet out and tick off every number you spot on doors, buses and price labels.',
    ],
    stages: {
      1: { label: '0–5', goal: 'Names and finds 0–5.', from: 0, to: 5 },
      2: { label: '0–10', goal: 'Names and finds 0–10, including 6 and 9.', from: 0, to: 10 },
      3: { label: '0–20', goal: 'Reads the teens without swapping the digits (12 and 21).', from: 0, to: 20 },
    },
  },
  'more-or-fewer': {
    id: 'more-or-fewer',
    title: 'More or fewer? cards',
    skill: 'comparison',
    game: 'more',
    blurb: 'Pairs of groups to compare: circle the one with more, cross the one with fewer.',
    how: [
      'Circle the side with more. Say it out loud: “five is more than three.”',
      'Then ask the other way round: “which has fewer?” Fewer is much harder than more.',
      'For the matching pairs, say “the same” — and check by lining the dots up one to one.',
    ],
    stages: {
      1: { label: '1–5', goal: 'Spots more when the difference is obvious.', from: 1, to: 5 },
      2: { label: '1–8', goal: 'Compares closer numbers and says more, fewer, the same.', from: 1, to: 8 },
      3: { label: '1–12', goal: 'Compares groups that look different: spread out vs bunched up.', from: 1, to: 12 },
    },
  },
  'unicorn-stories': {
    id: 'unicorn-stories',
    title: 'One more unicorn story board',
    skill: 'adding',
    game: 'add',
    blurb: 'A field, cut-out unicorns and story lines for “and one more makes…”.',
    how: [
      'Cut out the unicorns. Put some in the field, then let one more trot in: “how many now?”',
      'Nudge her to count on from the first group (“four… five!”) instead of starting again at one.',
      'Fill in a story line together, then let her make one up for you to answer.',
    ],
    stages: {
      1: { label: 'within 5', goal: 'One more and two more, with objects.', from: 1, to: 5 },
      2: { label: 'within 8', goal: 'Counts on from the first group.', from: 1, to: 8 },
      3: { label: 'within 10', goal: 'Adds one to three onto any number up to ten.', from: 1, to: 10 },
    },
  },
  'number-track': {
    id: 'number-track',
    title: 'Number track race',
    skill: 'rote',
    game: null,
    blurb: 'Roll, move and say the numbers along the track. Plus a track with numbers missing to fill in.',
    how: [
      'Take turns: roll a dice, move that many, say every number you land on out loud.',
      'Landing on a flower? Say the number one more and one less than the one you are on.',
      'On the blank track, fill in the missing numbers — that is where the wobbly bits show up.',
    ],
    stages: {
      1: { label: 'to 10', goal: 'Says the numbers to 10 in order.', from: 1, to: 10 },
      2: { label: 'to 20', goal: 'Counts to 20, including the teens.', from: 1, to: 20 },
      3: { label: 'to 30', goal: 'Counts to 30, and back from 10.', from: 1, to: 30 },
    },
  },
};

export const SHEET_LIST = Object.values(SHEETS);

export interface SheetOptions {
  id: SheetId;
  name: string;
  icon: string;
  stage: Stage;
}

export const isSheetId = (id: string): id is SheetId => id in SHEETS;

export const sheetLink = (id: SheetId, stage: Stage, name?: string, icon?: string) => {
  const params = new URLSearchParams({ id, stage: String(stage) });
  if (name) params.set('name', name);
  if (icon) params.set('icon', icon);
  return `#/resources/sheet?${params}`;
};

export function sheetOptionsFromParams(params: URLSearchParams): SheetOptions {
  const id = params.get('id') ?? '';
  const stage = Number(params.get('stage'));
  return {
    id: isSheetId(id) ? id : 'counting-mats',
    name: params.get('name') ?? '',
    icon: params.get('icon') || '🦄',
    stage: stage === 1 || stage === 2 || stage === 3 ? stage : 1,
  };
}
