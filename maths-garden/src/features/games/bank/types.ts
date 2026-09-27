/**
 * The question bank: fixed, checked questions for round types the random generators in `questions.ts` do not
 * cover (story sums, patterns, number tracks, doubles and sharing, coins, clocks, first/second/third).
 *
 * Everything a child meets is spoken or drawn: `say` and `hint` are read aloud in the British voice, and
 * `show` says how to draw the options — numerals, pictures, coins or clock faces, never words to read.
 * `level` follows the games' levels: 1–3 are the printable stages, 4–6 the challenge levels, 6 the gold one.
 *
 * Built by `tools/question-bank/build.ts`, checked by `validate.ts` (run in the test suite and by
 * `node tools/question-bank/validate.ts`). English only for now.
 */
export type BankTopic = 'story' | 'pattern' | 'sequence' | 'double' | 'money' | 'clock' | 'ordinal';
export type BankLevel = 1 | 2 | 3 | 4 | 5 | 6;
/** How the answer buttons are drawn. `pence` is a numeral with a p ("7p"); `coin` is a drawn coin; `clock` is a clock face. */
export type OptionShow = 'numeral' | 'emoji' | 'pence' | 'coin' | 'clock';

interface Base {
  /** Stable: `<topic>-<level>-<n>`. Logged per answer like a question key, so never reused for a different question. */
  id: string;
  topic: BankTopic;
  level: BankLevel;
  /** The skill it trains, finer than the topic ("count-on", "change", "half-past"). */
  skill: string;
  /** Extra difficulty and content markers: "within-10", "bridging-10", "misconception:coin-count". */
  tags: string[];
  /** The question, spoken. */
  say: string;
  /** Spoken after a wrong answer: a way in, never the answer. */
  hint: string;
  show: OptionShow;
}

/**
 * add: `a` and `b` more. take: `a`, `b` go. missing: have `a`, need `b` in all, how many more.
 * compare: one has `a`, the other `b` (a > b), how many more.
 */
export interface StoryItem extends Base {
  topic: 'story';
  op: 'add' | 'take' | 'missing' | 'compare';
  a: number;
  b: number;
  context: string;
  emoji: string;
  answer: number;
  options: number[];
}

/** A row with one gap (`null`): a repeating unit of pictures, or numbers counting on in `step`s. */
export type PatternItem = Base & { topic: 'pattern' } & (
    | { kind: 'repeat'; unit: string[]; row: (string | null)[]; answer: string; options: string[] }
    | { kind: 'count-by'; start: number; step: number; row: (number | null)[]; answer: number; options: number[] }
  );

/** A number track counting on or back in ones, with one gap. */
export interface SequenceItem extends Base {
  topic: 'sequence';
  kind: 'after' | 'before' | 'missing';
  row: (number | null)[];
  answer: number;
  options: number[];
}

/** double: `a` and `a` again. near-double: `a` and `b` = a + 1. half/share: `total` shared fairly between `groups`. */
export type DoubleItem = Base & { topic: 'double'; emoji: string; answer: number; options: number[] } & (
    | { kind: 'double' | 'near-double'; a: number; b: number }
    | { kind: 'half' | 'share'; total: number; groups: number }
  );

/** UK coins in pence: 1, 2, 5, 10, 20, 50, 100 (£1), 200 (£2). */
export type MoneyItem = Base & { topic: 'money'; answer: number; options: number[] } & (
    | { kind: 'which-coin' }
    | { kind: 'total'; coins: number[] }
    | { kind: 'change'; paid: number; price: number; emoji: string }
  );

/** Times are "h:mm" on a 12-hour face, o'clock and half past only. */
export type ClockItem = Base & { topic: 'clock' } & (
    | { kind: 'find'; answer: string; options: string[] }
    | { kind: 'read'; time: string; answer: number; options: number[] }
    | { kind: 'later' | 'earlier'; from: string; minutes: 30 | 60; answer: string; options: string[] }
  );

/** A queue of animals, `line[0]` at the front. which: who is `position`th from the `from` end. where: which place `target` is in. */
export type OrdinalItem = Base & { topic: 'ordinal'; line: string[] } & (
    | { kind: 'which'; position: number; from: 'front' | 'back'; answer: string; options: string[] }
    | { kind: 'where'; target: string; answer: number; options: number[] }
  );

export type BankItem = StoryItem | PatternItem | SequenceItem | DoubleItem | MoneyItem | ClockItem | OrdinalItem;

export const BANK_TOPICS: readonly BankTopic[] = ['story', 'pattern', 'sequence', 'double', 'money', 'clock', 'ordinal'];
export const UK_COINS: readonly number[] = [1, 2, 5, 10, 20, 50, 100, 200];
/** Answer buttons per level, as in the games: three to begin with, more at the challenge levels. */
export const OPTIONS_PER_LEVEL: Record<BankLevel, number> = { 1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 5 };
