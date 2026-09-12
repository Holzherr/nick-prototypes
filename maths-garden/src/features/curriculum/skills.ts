import type { GameId } from '@/features/games/catalog';
import type { ProbeId } from '@/features/progress/probes';

/**
 * The learning path: each skill has three stages. Paper printables teach a stage at home; the matching
 * game checks it on an iPad or phone, and levelling up in the game (level index = stage − 1) unlocks the
 * next stage's printables.
 */
export type SkillId = 'subitising' | 'counting' | 'numerals' | 'comparison' | 'adding' | 'bonds' | 'subtracting' | 'teens' | 'rote';
export type StageNumber = 1 | 2 | 3;

export interface SkillStage {
  stage: StageNumber;
  range: string;
  goal: string;
  /**
   * The age most children are working on this, as a guide only. The spread between two entirely typical
   * children is well over a year, and a child is usually on different stages for different skills.
   */
  age: string;
}

export interface Skill {
  id: SkillId;
  name: string;
  emoji: string;
  /** The game that checks it; rote counting is only checked by a grown-up. */
  game: GameId | null;
  probe: ProbeId;
  stages: readonly [SkillStage, SkillStage, SkillStage];
}

export const SKILLS: readonly Skill[] = [
  {
    id: 'subitising',
    name: 'Subitising',
    emoji: '👀',
    game: 'peek',
    probe: 'subitising',
    stages: [
      { stage: 1, range: '1–3', goal: 'Says 1, 2 or 3 at a glance, without counting.', age: '3–4' },
      { stage: 2, range: '1–5', goal: 'Up to 5 at a glance in dice, scattered, row and five-frame patterns.', age: '4–5' },
      { stage: 3, range: '6–10', goal: 'Sees 6–10 as two small groups or a ten frame.', age: '5–6' },
    ],
  },
  {
    id: 'counting',
    name: 'Counting objects',
    emoji: '🦋',
    game: 'count',
    probe: 'objects',
    stages: [
      { stage: 1, range: '1–5', goal: 'Touches each object once, one number per touch; the last number says how many.', age: '3–4' },
      { stage: 2, range: '1–8', goal: 'Keeps track of what has been counted in a messy group.', age: '4–5' },
      { stage: 3, range: '1–12', goal: 'Counts past 10 accurately and counts out a number asked for.', age: '5–6' },
    ],
  },
  {
    id: 'numerals',
    name: 'Numeral recognition',
    emoji: '🔢',
    game: 'find',
    probe: 'numerals',
    stages: [
      { stage: 1, range: '0–5', goal: 'Names and finds the numerals 0–5.', age: '3–4' },
      { stage: 2, range: '0–10', goal: 'Names and finds 0–10, including 6 and 9.', age: '4–5' },
      { stage: 3, range: '0–20', goal: 'Reads the teens without swapping digits (12 vs 21).', age: '5–6' },
    ],
  },
  {
    id: 'comparison',
    name: 'Comparison',
    emoji: '🍓',
    game: 'more',
    probe: 'compare',
    stages: [
      { stage: 1, range: '1–5', goal: 'Spots which group has more when the difference is clear.', age: '3–4' },
      { stage: 2, range: '1–8', goal: 'Compares close numbers and says “more”, “fewer”, “the same”.', age: '4–5' },
      { stage: 3, range: '1–12', goal: 'Compares groups that look different (big spread vs small tight).', age: '5–6' },
    ],
  },
  {
    id: 'adding',
    name: 'Adding on',
    emoji: '🦄',
    game: 'add',
    probe: 'adding',
    stages: [
      { stage: 1, range: 'within 5', goal: '“One more” and “two more” with objects.', age: '4–5' },
      { stage: 2, range: 'within 8', goal: 'Counts on from the first group instead of starting again.', age: '5–6' },
      { stage: 3, range: 'within 10', goal: 'Adds 1–3 on to any number up to 10.', age: '6–7' },
    ],
  },
  {
    id: 'bonds',
    name: 'Number bonds',
    emoji: '🧩',
    game: 'bond',
    probe: 'bonds',
    stages: [
      { stage: 1, range: 'to 5', goal: 'Knows the pairs that make 5, with a frame to look at.', age: '4–5' },
      { stage: 2, range: 'to 10', goal: 'Finds the missing part of 10 on a ten frame.', age: '5–6' },
      { stage: 3, range: 'to 10, in her head', goal: 'Says what goes with a number to make 10 without seeing it.', age: '6–7' },
    ],
  },
  {
    id: 'subtracting',
    name: 'Taking away',
    emoji: '🎈',
    game: 'fewer',
    probe: 'fewer',
    stages: [
      { stage: 1, range: 'within 5', goal: 'One fewer, with objects she can see go.', age: '4–5' },
      { stage: 2, range: 'within 8', goal: 'Counts back one or two instead of recounting what is left.', age: '5–6' },
      { stage: 3, range: 'within 10', goal: 'Takes one to three away from any number up to ten.', age: '6–7' },
    ],
  },
  {
    id: 'teens',
    name: 'Teen numbers',
    emoji: '🔟',
    game: 'teen',
    probe: 'teens',
    stages: [
      { stage: 1, range: '11–15', goal: 'Sees a full ten and some more, and says the teen number.', age: '4–5' },
      { stage: 2, range: '11–19', goal: 'Knows thirteen is ten and three, not three and ten.', age: '5–6' },
      { stage: 3, range: '11–20', goal: 'Says the teen number without a frame to count.', age: '6–7' },
    ],
  },
  {
    id: 'rote',
    name: 'Rote counting',
    emoji: '🗣️',
    game: null,
    probe: 'rote',
    stages: [
      { stage: 1, range: 'to 10', goal: 'Says the numbers to 10 in order.', age: '3–4' },
      { stage: 2, range: 'to 20', goal: 'Counts to 20 including the teens.', age: '4–5' },
      { stage: 3, range: 'to 30, back from 10', goal: 'Counts to 30 and back from 10 (rocket countdown).', age: '5–6' },
    ],
  },
];

export const skillForGame = (game: GameId): Skill | undefined => SKILLS.find((s) => s.game === game);

export const skillById = (id: SkillId): Skill | undefined => SKILLS.find((s) => s.id === id);

/** The typical age for one stage of one skill ("4–5"), for labelling printables and stage pickers. */
export const stageAge = (skill: SkillId, stage: StageNumber): string => skillById(skill)?.stages[stage - 1].age ?? '';
