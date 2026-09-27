/**
 * Builds src/features/games/bank/question-bank.json. Deterministic: the same seed writes the same file.
 *   node tools/question-bank/build.ts
 * Every topic enumerates its candidates per level first, then takes a seeded sample, so a small level
 * prints fewer questions rather than repeating one. Check the output with validate.ts, never by eye.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { BankItem, BankLevel } from '../../src/features/games/bank/types.ts';
import { OPTIONS_PER_LEVEL } from '../../src/features/games/bank/types.ts';

const OUT = fileURLToPath(new URL('../../src/features/games/bank/question-bank.json', import.meta.url));
const LEVELS: BankLevel[] = [1, 2, 3, 4, 5, 6];

// ---------- randomness ----------
const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rng = mulberry32(20260927);
const pick = <T>(items: readonly T[]): T => items[Math.floor(rng() * items.length)];
const shuffle = <T>(items: T[]): T[] => {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};
const range = (lo: number, hi: number) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// ---------- words ----------
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const word = (n: number): string => {
  if (n < 20) return ONES[n];
  if (n === 100) return 'one hundred';
  if (n > 100 && n < 200) return `one hundred and ${word(n - 100)}`;
  const t = TENS[Math.floor(n / 10)];
  return n % 10 ? `${t}-${ONES[n % 10]}` : t;
};
const Word = (n: number) => word(n)[0].toUpperCase() + word(n).slice(1);
const ORDINALS = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];
const pence = (p: number) => (p === 100 ? 'one pound' : p === 200 ? 'two pounds' : p === 1 ? 'one penny' : `${word(p)} pence`);

// ---------- options ----------
/**
 * The answer plus distractors in [lo, hi]: the named misconceptions first (at most two, and always leaving a
 * slot free), then near misses, then anything.
 */
function numOptions(answer: number, count: number, lo: number, hi: number, misconceptions: number[] = []): number[] {
  const set = new Set([answer]);
  for (const m of misconceptions) if (set.size < count - 1 && set.size < 3 && m >= lo && m <= hi && Number.isInteger(m)) set.add(m);
  for (const d of shuffle([-1, 1, -2, 2])) if (set.size < count && answer + d >= lo && answer + d <= hi) set.add(answer + d);
  let guard = 0;
  while (set.size < count && guard++ < 500) set.add(lo + Math.floor(rng() * (hi - lo + 1)));
  return shuffle([...set]);
}
const optionsFrom = <T>(answer: T, pool: readonly T[], count: number): T[] => shuffle([answer, ...shuffle(pool.filter((x) => x !== answer)).slice(0, count - 1)]);

/** Take up to `n` distinct candidates, spread by the seeded shuffle. */
const sample = <T>(candidates: T[], n: number, key: (c: T) => string): T[] => {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const c of shuffle(candidates)) {
    const k = key(c);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c);
    if (out.length === n) break;
  }
  return out;
};

const items: BankItem[] = [];
const counters = new Map<string, number>();
const nextId = (topic: string, level: number) => {
  const k = `${topic}-${level}`;
  const n = (counters.get(k) ?? 0) + 1;
  counters.set(k, n);
  return `${k}-${String(n).padStart(2, '0')}`;
};

// ---------- story sums ----------
interface Context {
  id: string;
  emoji: string;
  one: string;
  many: string;
  place: string;
  /** Singular and plural verb phrases: "swims over" / "swim over". */
  come: [string, string];
  go: [string, string];
  /** Things a character can have, so "the fox has seven shells" makes sense. */
  ownable?: boolean;
}
const CONTEXTS: Context[] = [
  { id: 'duck-pond', emoji: '🦆', one: 'duck', many: 'ducks', place: 'on the pond', come: ['swims over', 'swim over'], go: ['waddles off', 'waddle off'] },
  { id: 'bus-stop', emoji: '🧍', one: 'person', many: 'people', place: 'at the bus stop', come: ['joins the queue', 'join the queue'], go: ['gets on the bus', 'get on the bus'] },
  { id: 'bakery', emoji: '🥐', one: 'croissant', many: 'croissants', place: 'on the bakery shelf', come: ['comes out of the oven', 'come out of the oven'], go: ['is sold', 'are sold'] },
  { id: 'rock-pool', emoji: '🦀', one: 'crab', many: 'crabs', place: 'in the rock pool', come: ['scuttles in', 'scuttle in'], go: ['hides under a rock', 'hide under a rock'] },
  { id: 'allotment', emoji: '🥕', one: 'carrot', many: 'carrots', place: 'in the allotment', come: ['is planted', 'are planted'], go: ['is pulled up', 'are pulled up'] },
  { id: 'bird-feeder', emoji: '🐦', one: 'bird', many: 'birds', place: 'on the bird feeder', come: ['lands', 'land'], go: ['flies away', 'fly away'] },
  { id: 'conkers', emoji: '🌰', one: 'conker', many: 'conkers', place: 'in the bag', come: ['goes in', 'go in'], go: ['rolls out', 'roll out'], ownable: true },
  { id: 'hen-house', emoji: '🥚', one: 'egg', many: 'eggs', place: 'in the hen house', come: ['is laid', 'are laid'], go: ['is collected', 'are collected'] },
  { id: 'seaside', emoji: '🐚', one: 'shell', many: 'shells', place: 'in the seaside bucket', come: ['is found', 'are found'], go: ['falls out', 'fall out'], ownable: true },
  { id: 'field', emoji: '🐑', one: 'sheep', many: 'sheep', place: 'in the field', come: ['trots in', 'trot in'], go: ['wanders off', 'wander off'] },
  { id: 'fairy-cakes', emoji: '🧁', one: 'fairy cake', many: 'fairy cakes', place: 'on the plate', come: ['comes out of the oven', 'come out of the oven'], go: ['is eaten', 'are eaten'], ownable: true },
  { id: 'biscuit-tin', emoji: '🍪', one: 'biscuit', many: 'biscuits', place: 'in the tin', come: ['is put in', 'are put in'], go: ['is eaten', 'are eaten'], ownable: true },
  { id: 'picnic', emoji: '🍓', one: 'strawberry', many: 'strawberries', place: 'in the picnic basket', come: ['is picked', 'are picked'], go: ['is eaten', 'are eaten'], ownable: true },
  { id: 'park-kites', emoji: '🪁', one: 'kite', many: 'kites', place: 'in the sky over the park', come: ['goes up', 'go up'], go: ['comes down', 'come down'] },
  { id: 'lily-pads', emoji: '🐸', one: 'frog', many: 'frogs', place: 'on the lily pads', come: ['hops on', 'hop on'], go: ['jumps in the water', 'jump in the water'] },
  { id: 'boating-lake', emoji: '⛵', one: 'boat', many: 'boats', place: 'on the boating lake', come: ['sails in', 'sail in'], go: ['sails away', 'sail away'] },
  { id: 'flower-bed', emoji: '🐝', one: 'bee', many: 'bees', place: 'on the flowers', come: ['buzzes over', 'buzz over'], go: ['buzzes off', 'buzz off'] },
  { id: 'school-gate', emoji: '☂️', one: 'umbrella', many: 'umbrellas', place: 'at the school gate', come: ['opens', 'open'], go: ['closes', 'close'] },
  { id: 'library', emoji: '📕', one: 'book', many: 'books', place: 'on the library trolley', come: ['is added', 'are added'], go: ['is borrowed', 'are borrowed'] },
  { id: 'garden-wall', emoji: '🐌', one: 'snail', many: 'snails', place: 'on the garden wall', come: ['slides up', 'slide up'], go: ['slides away', 'slide away'] },
  { id: 'fruit-bowl', emoji: '🍎', one: 'apple', many: 'apples', place: 'in the fruit bowl', come: ['is added', 'are added'], go: ['is eaten', 'are eaten'], ownable: true },
  { id: 'train', emoji: '🚃', one: 'carriage', many: 'carriages', place: 'on the train', come: ['is joined on', 'are joined on'], go: ['is taken off', 'are taken off'] },
  { id: 'stickers', emoji: '⭐', one: 'sticker', many: 'stickers', place: 'on the chart', come: ['is stuck on', 'are stuck on'], go: ['peels off', 'peel off'], ownable: true },
  { id: 'pebbles', emoji: '🪨', one: 'pebble', many: 'pebbles', place: 'by the stream', come: ['is found', 'are found'], go: ['is thrown in', 'are thrown in'], ownable: true },
];
/** Original characters only (G-01, G-14): no film or brand characters. */
const CHARACTERS = ['the fox', 'the owl', 'the hedgehog', 'the rabbit', 'the badger', 'the squirrel'];

const noun = (c: Context, n: number) => (n === 1 ? c.one : c.many);
const there = (c: Context, n: number) => `There ${n === 1 ? 'is' : 'are'} ${word(n)} ${noun(c, n)} ${c.place}.`;

type StoryCand = { op: 'add' | 'take' | 'missing' | 'compare'; a: number; b: number; skill: string; tags: string[] };
const storyPlan: Record<BankLevel, { n: number; cands: StoryCand[] }> = {
  1: { n: 16, cands: range(1, 4).map((a) => ({ op: 'add', a, b: 1, skill: 'one-more', tags: ['within-5'] })) },
  2: {
    n: 18,
    cands: [
      ...range(1, 4).flatMap((a) => [1, 2].filter((b) => a + b <= 5).map((b): StoryCand => ({ op: 'add', a, b, skill: 'count-on', tags: ['within-5'] }))),
      ...range(2, 5).flatMap((a) => [1, 2].filter((b) => b < a).map((b): StoryCand => ({ op: 'take', a, b, skill: 'count-back', tags: ['within-5'] }))),
    ],
  },
  3: {
    n: 20,
    cands: [
      ...range(2, 9).flatMap((a) => [1, 2, 3].filter((b) => a + b <= 10).map((b): StoryCand => ({ op: 'add', a, b, skill: 'count-on', tags: ['within-10'] }))),
      ...range(4, 10).flatMap((a) => [1, 2, 3].filter((b) => b < a).map((b): StoryCand => ({ op: 'take', a, b, skill: 'count-back', tags: ['within-10'] }))),
    ],
  },
  4: {
    n: 20,
    cands: [
      ...range(3, 8).flatMap((a) => [4, 5].filter((b) => a + b <= 10).map((b): StoryCand => ({ op: 'add', a, b, skill: 'count-on', tags: ['within-10'] }))),
      ...range(6, 10).flatMap((a) => [4, 5].filter((b) => b < a).map((b): StoryCand => ({ op: 'take', a, b, skill: 'count-back', tags: ['within-10'] }))),
      ...range(3, 9).flatMap((a) => [5, 10].filter((b) => b > a).map((b): StoryCand => ({ op: 'missing', a, b, skill: 'missing-part', tags: ['within-10', 'bonds'] }))),
    ],
  },
  5: {
    n: 20,
    cands: [
      ...range(11, 17).flatMap((a) => [1, 2, 3].filter((b) => a + b <= 20).map((b): StoryCand => ({ op: 'add', a, b, skill: 'count-on', tags: ['within-20', 'teens'] }))),
      ...range(13, 19).flatMap((a) => [1, 2, 3].filter((b) => a - b > 10).map((b): StoryCand => ({ op: 'take', a, b, skill: 'count-back', tags: ['within-20', 'teens'] }))),
      ...range(3, 10).flatMap((a) => range(1, a - 1).filter((b) => a - b <= 4).map((b): StoryCand => ({ op: 'compare', a, b, skill: 'difference', tags: ['within-10'] }))),
    ],
  },
  6: {
    n: 22,
    cands: [
      ...range(6, 9).flatMap((a) => range(3, 9).filter((b) => a + b > 10 && a + b <= 18).map((b): StoryCand => ({ op: 'add', a, b, skill: 'bridge-ten', tags: ['within-20', 'bridging-10'] }))),
      ...range(11, 16).flatMap((a) => range(3, 8).filter((b) => a - b < 10 && a - b > 0).map((b): StoryCand => ({ op: 'take', a, b, skill: 'bridge-ten', tags: ['within-20', 'bridging-10'] }))),
      ...range(12, 18).map((a): StoryCand => ({ op: 'missing', a, b: 20, skill: 'missing-part', tags: ['within-20', 'bonds'] })),
      ...range(8, 18).flatMap((a) => range(3, a - 1).filter((b) => a - b >= 3 && a - b <= 8).map((b): StoryCand => ({ op: 'compare', a, b, skill: 'difference', tags: ['within-20'] }))),
    ],
  },
};

const usedStories = new Set<string>();
function story(level: BankLevel, c: StoryCand) {
  const { op, a, b } = c;
  const ctxPool = op === 'compare' || op === 'missing' ? CONTEXTS.filter((x) => x.ownable) : CONTEXTS;
  // The same sum is never told twice in the same place.
  let ctx = pick(ctxPool);
  for (let i = 0; i < 50 && usedStories.has(`${op}${a},${b}@${ctx.id}`); i++) ctx = pick(ctxPool);
  usedStories.add(`${op}${a},${b}@${ctx.id}`);
  let say = '';
  let hint = '';
  let answer = 0;
  let mis: number[] = [];
  let hi = 20;
  switch (op) {
    case 'add':
      answer = a + b;
      say = `${there(ctx, a)} ${Word(b)} more ${noun(ctx, b)} ${ctx.come[b === 1 ? 0 : 1]}. How many ${ctx.many} are there now?`;
      hint = c.tags.includes('bridging-10') ? `Make ten first, then add the rest.` : `Start at ${word(a)} and count on ${word(b)}.`;
      mis = [a, answer + 1];
      hi = level <= 2 ? 6 : level <= 4 ? 10 : 20;
      break;
    case 'take':
      answer = a - b;
      say = `${there(ctx, a)} ${Word(b)} ${noun(ctx, b)} ${ctx.go[b === 1 ? 0 : 1]}. How many ${ctx.many} are left?`;
      hint = c.tags.includes('bridging-10') ? `Take away down to ten first, then the rest.` : `Start at ${word(a)} and count back ${word(b)}.`;
      mis = [a + b, answer + 1];
      hi = level <= 2 ? 7 : level <= 4 ? 13 : 20;
      break;
    case 'missing': {
      answer = b - a;
      const who = pick(CHARACTERS);
      const Who = who[0].toUpperCase() + who.slice(1);
      say = `${Who} has ${word(a)} ${noun(ctx, a)}. ${Who} wants ${word(b)}. How many more does ${who} need?`;
      hint = `Start at ${word(a)} and count up to ${word(b)}.`;
      mis = [a, answer + 1];
      break;
    }
    case 'compare': {
      answer = a - b;
      const [p, q] = shuffle(CHARACTERS).slice(0, 2);
      const P = p[0].toUpperCase() + p.slice(1);
      const Q = q[0].toUpperCase() + q.slice(1);
      say = `${P} has ${word(a)} ${noun(ctx, a)}. ${Q} has ${word(b)} ${noun(ctx, b)}. How many more does ${p} have?`;
      hint = 'Match them up in pairs, then count what is left over.';
      mis = [a + b > 20 ? -1 : a + b, answer + 1];
      break;
    }
  }
  const options = numOptions(answer, OPTIONS_PER_LEVEL[level], op === 'take' || op === 'compare' ? 1 : 1, Math.max(hi, answer + 2), mis);
  items.push({ id: nextId('story', level), topic: 'story', level, skill: c.skill, tags: [...c.tags, `op:${op}`], say, hint, show: 'numeral', op, a, b, context: ctx.id, emoji: ctx.emoji, answer, options });
}

// ---------- patterns ----------
const PICTURE_SETS = [
  ['🔴', '🔵', '🟡', '🟢'],
  ['🍎', '🍌', '🍇', '🍐'],
  ['🐶', '🐱', '🐭', '🐰'],
  ['⭐', '🌙', '☀️', '☁️'],
  ['🌸', '🍃', '🌼', '🍄'],
  ['🟥', '🟦', '🟨', '🟩'],
  ['🐞', '🐝', '🦋', '🐛'],
];
/** Unit shapes as letter strings: "AB", "AAB", "ABC"… */
const patternPlan: Record<BankLevel, { n: number; units: string[]; gap: 'next' | 'middle'; min: number }> = {
  1: { n: 14, units: ['AB'], gap: 'next', min: 4 },
  2: { n: 14, units: ['AB', 'AAB', 'ABB'], gap: 'next', min: 5 },
  3: { n: 14, units: ['ABC', 'AAB', 'ABB'], gap: 'next', min: 6 },
  4: { n: 14, units: ['AABB', 'AABC', 'ABCC', 'ABBC', 'ABC'], gap: 'next', min: 8 },
  5: { n: 14, units: ['AB', 'AAB', 'ABB', 'ABC', 'AABB', 'ABCD'], gap: 'middle', min: 8 },
  6: { n: 16, units: [], gap: 'next', min: 0 },
};

function repeatPattern(level: BankLevel, shape: string, set: string[], length: number, blank: number) {
  const letters = [...new Set(shape)];
  const chosen = shuffle(set).slice(0, letters.length);
  const unit = [...shape].map((ch) => chosen[letters.indexOf(ch)]);
  const full = range(0, length - 1).map((i) => unit[i % unit.length]);
  const answer = full[blank];
  const row = full.map((x, i) => (i === blank ? null : x));
  const spare = set.filter((x) => !chosen.includes(x));
  const options = optionsFrom(answer, [...new Set(unit), ...spare], OPTIONS_PER_LEVEL[level]);
  const say = blank === length - 1 ? 'Look at the pattern. What comes next?' : 'Something is missing from the pattern. What goes in the gap?';
  const hint = blank === length - 1 ? 'Say the pattern out loud as you point to each one.' : 'Say the pattern from the start and stop at the gap.';
  items.push({ id: nextId('pattern', level), topic: 'pattern', level, skill: 'repeating-pattern', tags: [`unit:${shape}`, blank === length - 1 ? 'gap:end' : 'gap:middle'], say, hint, show: 'emoji', kind: 'repeat', unit, row, answer, options });
}

// ---------- number tracks ----------
function track(level: BankLevel, kind: 'after' | 'before' | 'missing', row: (number | null)[], answer: number, tags: string[]) {
  const shown = row.filter((x): x is number => x !== null);
  const step = row.length > 1 ? (row[1] ?? answer) - (row[0] ?? answer) : 1;
  let say: string;
  let hint: string;
  if (kind === 'after' && step < 0) {
    say = `Count back with me: ${shown.map(word).join(', ')}. What comes next?`;
    hint = 'Keep counting back, like a rocket countdown.';
  } else if (kind === 'after') {
    say = `What number comes after ${word(shown[shown.length - 1])}?`;
    hint = `Count up from ${word(shown[0])}, pointing at each one.`;
  } else if (kind === 'before') {
    say = `What number comes just before ${word(shown[0])}?`;
    hint = `Count back from ${word(shown[0])}. Which number do you say next?`;
  } else {
    say = 'A number has fallen off the track. Which number goes in the gap?';
    hint = `Count along the track from ${word(shown[0])}.`;
  }
  const lo = Math.max(0, answer - 10);
  const mis = [answer + (step > 0 ? -2 : 2)];
  if (answer >= 12) {
    const swapped = Number(String(answer).split('').reverse().join(''));
    if (swapped !== answer && swapped > 0) mis.unshift(swapped);
  }
  const options = numOptions(answer, OPTIONS_PER_LEVEL[level], lo, answer + 10, mis);
  items.push({ id: nextId('sequence', level), topic: 'sequence', level, skill: kind === 'after' && step < 0 ? 'count-back' : `number-${kind}`, tags, say, hint, show: 'numeral', kind, row, answer, options });
}
const runOf = (start: number, len: number, step: number) => range(0, len - 1).map((i) => start + i * step);

// ---------- build ----------
function build() {
  // Story sums
  for (const level of LEVELS) {
    const plan = storyPlan[level];
    // Every candidate once where there are fewer than asked (level 1), then more with fresh contexts.
    const base = sample(plan.cands, plan.n, (c) => `${c.op}${c.a},${c.b}`);
    const extra = base.length < plan.n ? shuffle(plan.cands).concat(shuffle(plan.cands)).slice(0, plan.n - base.length) : [];
    for (const c of [...base, ...extra]) story(level, c);
  }

  // Patterns
  for (const level of LEVELS) {
    const plan = patternPlan[level];
    if (level === 6) {
      const cands = [
        ...[0, 2, 4, 6].map((s) => ({ start: s, step: 2 })),
        ...[1, 3, 5].map((s) => ({ start: s, step: 2 })),
        ...[0, 5, 10, 15].map((s) => ({ start: s, step: 5 })),
        ...[0, 10, 20, 30].map((s) => ({ start: s, step: 10 })),
        ...[20, 18, 16].map((s) => ({ start: s, step: -2 })),
        ...[100, 90, 70].map((s) => ({ start: s, step: -10 })),
      ];
      for (const { start, step } of sample(cands, plan.n, (c) => `${c.start}/${c.step}`)) {
        const full = runOf(start, 5, step);
        const blank = rng() < 0.5 ? 4 : 1 + Math.floor(rng() * 3);
        const answer = full[blank];
        const row = full.map((x, i) => (i === blank ? null : x));
        const s = Math.abs(step);
        const options = numOptions(answer, OPTIONS_PER_LEVEL[level], 0, 100, [answer - step + Math.sign(step) /* counted on in ones */, answer + step]);
        const say = blank === 4 ? `We are counting in ${word(s)}s${step < 0 ? ', backwards' : ''}. What comes next?` : `We are counting in ${word(s)}s${step < 0 ? ', backwards' : ''}. Which number goes in the gap?`;
        const hint = `Count in ${word(s)}s from ${word(full[0])}.`;
        const tags = [`step:${step}`, s === 2 && start % 2 ? 'odd-numbers' : `count-in-${s}s`, blank === 4 ? 'gap:end' : 'gap:middle'];
        items.push({ id: nextId('pattern', level), topic: 'pattern', level, skill: 'counting-in-steps', tags, say, hint, show: 'numeral', kind: 'count-by', start, step, row, answer, options });
      }
      continue;
    }
    const cands: { shape: string; set: number; length: number; blank: number }[] = [];
    for (const shape of plan.units)
      for (let set = 0; set < PICTURE_SETS.length; set++) {
        const len = Math.max(plan.min, shape.length * 2 + 1);
        for (const length of [len, len + 1, len + 2]) {
          if (plan.gap === 'next') cands.push({ shape, set, length, blank: length - 1 });
          // A middle gap needs a whole unit on each side of it, or the pattern is not yet known.
          else for (let blank = shape.length; blank < length - shape.length; blank++) cands.push({ shape, set, length, blank });
        }
      }
    for (const c of sample(cands, plan.n, (c) => `${c.shape}${c.set}/${c.length}/${c.blank}`)) repeatPattern(level, c.shape, PICTURE_SETS[c.set], c.length, c.blank);
  }

  // Number tracks
  const trackPlan: Record<BankLevel, () => { kind: 'after' | 'before' | 'missing'; row: (number | null)[]; answer: number; tags: string[] }[]> = {
    1: () => range(1, 4).flatMap((x) => [
      { kind: 'after' as const, row: [...runOf(Math.max(1, x - 2), Math.min(3, x), 1), null], answer: x + 1, tags: ['within-5'] },
      { kind: 'after' as const, row: [x, null], answer: x + 1, tags: ['within-5'] },
    ]),
    2: () => range(3, 9).flatMap((x) => [
      { kind: 'after' as const, row: [...runOf(x - 2, 3, 1), null], answer: x + 1, tags: ['within-10'] },
      { kind: 'after' as const, row: [x, null], answer: x + 1, tags: ['within-10'] },
    ]),
    3: () => [
      ...range(2, 8).map((x) => ({ kind: 'before' as const, row: [null, ...runOf(x, 3, 1)], answer: x - 1, tags: ['within-10'] })),
      ...range(4, 10).map((x) => ({ kind: 'after' as const, row: [...runOf(x, 3, -1), null], answer: x - 3, tags: ['within-10', 'count-back'] })),
    ],
    4: () => range(3, 17).map((x) => {
      const blank = 1 + (x % 3);
      const full = runOf(x - blank, 5, 1);
      return { kind: 'missing' as const, row: full.map((v, i) => (i === blank ? null : v)), answer: full[blank], tags: ['within-20'] };
    }),
    5: () => [
      ...range(11, 18).map((x) => ({ kind: 'before' as const, row: [null, ...runOf(x, 3, 1)], answer: x - 1, tags: ['within-20', 'teens'] })),
      ...range(13, 20).map((x) => ({ kind: 'after' as const, row: [...runOf(x, 3, -1), null], answer: x - 3, tags: ['within-20', 'count-back'] })),
    ],
    6: () => [
      ...[19, 29, 39, 49, 59, 69, 79, 89, 99].map((x) => ({ kind: 'after' as const, row: [...runOf(x - 2, 3, 1), null], answer: x + 1, tags: ['to-100', 'cross-tens'] })),
      ...[20, 30, 40, 50, 60, 70, 80, 90].map((x) => ({ kind: 'before' as const, row: [null, ...runOf(x, 3, 1)], answer: x - 1, tags: ['to-100', 'cross-tens'] })),
      ...[23, 37, 45, 58, 64, 76, 82, 91].map((x) => {
        const full = runOf(x - 2, 5, 1);
        return { kind: 'missing' as const, row: full.map((v, i) => (i === 2 ? null : v)), answer: x, tags: ['to-100'] };
      }),
    ],
  };
  const trackN: Record<BankLevel, number> = { 1: 12, 2: 14, 3: 14, 4: 14, 5: 14, 6: 18 };
  for (const level of LEVELS) {
    const cands = trackPlan[level]();
    const chosen = sample(cands, trackN[level], (c) => `${c.kind}${c.row.join(',')}`);
    // Level 1 has only four distinct tracks; each is asked from a shorter and a longer run.
    if (level === 1) for (const x of range(2, 4)) chosen.push({ kind: 'after', row: [...runOf(1, x, 1), null], answer: x + 1, tags: ['within-5'] });
    for (const c of sample(chosen, trackN[level], (c) => `${c.kind}${c.row.join(',')}`)) track(level, c.kind, c.row, c.answer, c.tags);
  }

  // Doubles, halves and sharing
  const DOUBLE_SAYS: ((n: number) => [string, string])[] = [
    (n) => [`A ladybird has ${word(n)} ${n === 1 ? 'spot' : 'spots'} on each wing. How many spots altogether?`, '🐞'],
    (n) => [`There ${n === 1 ? 'is' : 'are'} ${word(n)} ${n === 1 ? 'cake' : 'cakes'} on each of two plates. How many cakes altogether?`, '🧁'],
    (n) => [`Two boats each carry ${word(n)} ${n === 1 ? 'duck' : 'ducks'}. How many ducks altogether?`, '🦆'],
    (n) => [`Double ${word(n)}. ${Word(n)} and ${word(n)} again. How many is that?`, '🔵'],
    (n) => [`The domino has ${word(n)} ${n === 1 ? 'dot' : 'dots'} on each side. How many dots altogether?`, '⚫'],
  ];
  const SHARE_SAYS: ((t: number, g: number) => [string, string])[] = [
    (t, g) => [`Share ${word(t)} strawberries fairly between ${word(g)} bears. How many does each bear get?`, '🍓'],
    (t, g) => [`${Word(t)} biscuits are shared fairly between ${word(g)} friends. How many does each friend get?`, '🍪'],
    (t, g) => [`Put ${word(t)} eggs into ${word(g)} nests, the same in each. How many eggs in each nest?`, '🥚'],
    (t, g) => [`${Word(t)} conkers are shared fairly between ${word(g)} squirrels. How many does each squirrel get?`, '🌰'],
  ];
  const HALF_SAYS: ((t: number) => [string, string])[] = [
    (t) => [`Half of ${word(t)} apples. How many is half?`, '🍎'],
    (t) => [`Put ${word(t)} sandwiches on two plates, the same on each. How many on each plate?`, '🥪'],
  ];
  type DCand = { kind: 'double' | 'near-double' | 'half' | 'share'; x: number; y: number; tags: string[] };
  const doublePlan: Record<BankLevel, { n: number; cands: DCand[] }> = {
    1: { n: 12, cands: range(1, 3).map((x) => ({ kind: 'double', x, y: x, tags: ['double-to-6'] })) },
    2: { n: 14, cands: range(1, 5).map((x) => ({ kind: 'double', x, y: x, tags: ['double-to-10'] })) },
    3: { n: 14, cands: range(1, 5).flatMap((h) => [{ kind: 'half' as const, x: h * 2, y: 2, tags: ['half-to-10'] }, { kind: 'share' as const, x: h * 2, y: 2, tags: ['share-by-2'] }]) },
    4: { n: 14, cands: [...range(3, 6).map((h) => ({ kind: 'share' as const, x: h * 2, y: 2, tags: ['share-by-2'] })), ...range(2, 4).map((h) => ({ kind: 'share' as const, x: h * 3, y: 3, tags: ['share-by-3'] })), ...range(4, 5).map((x) => ({ kind: 'double' as const, x, y: x, tags: ['double-to-10'] }))] },
    5: { n: 14, cands: [...range(6, 10).map((x) => ({ kind: 'double' as const, x, y: x, tags: ['double-to-20'] })), ...range(6, 10).map((h) => ({ kind: 'half' as const, x: h * 2, y: 2, tags: ['half-to-20'] }))] },
    6: { n: 16, cands: [...range(2, 9).map((x) => ({ kind: 'near-double' as const, x, y: x + 1, tags: ['near-double'] })), ...range(2, 5).map((h) => ({ kind: 'share' as const, x: h * 4, y: 4, tags: ['share-by-4'] })), ...range(3, 5).map((h) => ({ kind: 'share' as const, x: h * 3, y: 3, tags: ['share-by-3'] }))] },
  };
  for (const level of LEVELS) {
    const plan = doublePlan[level];
    const pool = sample(plan.cands, plan.n, (c) => `${c.kind}${c.x}/${c.y}`);
    // Small levels repeat a sum in a different picture ("double two" as a ladybird, then as plates).
    const all = [...pool];
    while (all.length < plan.n) all.push(...shuffle(pool));
    all.length = Math.min(all.length, plan.n);
    const used = new Set<string>();
    for (const c of all) {
      let say: string;
      let emoji: string;
      let tries = 0;
      do {
        if (c.kind === 'double') [say, emoji] = pick(DOUBLE_SAYS)(c.x);
        else if (c.kind === 'near-double') [say, emoji] = [`${Word(c.x)} and ${word(c.y)}. How many altogether?`, '🔵'];
        else if (c.kind === 'half') [say, emoji] = pick(HALF_SAYS)(c.x);
        else [say, emoji] = pick(SHARE_SAYS)(c.x, c.y);
      } while (used.has(say) && tries++ < 30);
      used.add(say);
      if (c.kind === 'double' || c.kind === 'near-double') {
        const answer = c.x + c.y;
        const hint = c.kind === 'double' ? 'Double means the same again. Count them all.' : `Double ${word(c.x)}, then one more.`;
        const options = numOptions(answer, OPTIONS_PER_LEVEL[level], 1, Math.max(answer + 3, 6), [c.x + 1, c.x * 2 === answer ? c.x : c.x * 2]);
        items.push({ id: nextId('double', level), topic: 'double', level, skill: c.kind, tags: c.tags, say, hint, show: 'numeral', emoji, kind: c.kind, a: c.x, b: c.y, answer, options });
      } else {
        const answer = c.x / c.y;
        const hint = c.kind === 'half' ? 'Half means two equal groups.' : 'Hand them out in turns until they are all gone.';
        const options = numOptions(answer, OPTIONS_PER_LEVEL[level], 1, Math.max(answer + 3, 6), [c.x, answer * 2 <= c.x ? c.x - answer : -1]);
        items.push({ id: nextId('double', level), topic: 'double', level, skill: c.kind, tags: c.tags, say, hint, show: 'numeral', emoji, kind: c.kind, total: c.x, groups: c.y, answer, options });
      }
    }
  }

  // Money
  const SHOP = [['🍎', 'apple'], ['🍌', 'banana'], ['🍭', 'lolly'], ['🎈', 'balloon'], ['🍪', 'biscuit'], ['✏️', 'pencil'], ['🥕', 'carrot'], ['🧸', 'little teddy']] as const;
  const totalItem = (level: BankLevel, coins: number[], tags: string[]) => {
    const answer = coins.reduce((s, c) => s + c, 0);
    const say = coins.every((c) => c === 1) ? 'Count the pennies. How much money is here?' : 'How much money is here altogether?';
    const hint = coins.every((c) => c === 1) ? 'Each penny is one p. Touch each one as you count.' : 'Start with the biggest coin, then count on.';
    const mis = coins.every((c) => c === 1) ? [] : [coins.length];
    const options = numOptions(answer, OPTIONS_PER_LEVEL[level], 1, Math.max(answer + 5, 10), mis);
    const sorted = [...coins].sort((x, y) => y - x);
    items.push({ id: nextId('money', level), topic: 'money', level, skill: 'coin-total', tags: coins.every((c) => c === 1) ? tags : [...tags, 'misconception:coin-count'], say, hint, show: 'pence', kind: 'total', coins: sorted, answer, options });
  };
  const bags = (values: number[], minN: number, maxN: number, maxTotal: number): number[][] => {
    const out: number[][] = [];
    const rec = (start: number, acc: number[]) => {
      if (acc.length >= minN && acc.reduce((s, c) => s + c, 0) <= maxTotal && new Set(acc).size > (minN > 1 ? 1 : 0)) out.push([...acc]);
      if (acc.length === maxN) return;
      for (let i = start; i < values.length; i++) rec(i, [...acc, values[i]]);
    };
    rec(0, []);
    return out;
  };
  for (const level of LEVELS) {
    const whichCoin = (target: number, pool: number[]) =>
      items.push({ id: nextId('money', level), topic: 'money', level, skill: 'coin-recognition', tags: [`coin:${target}p`], say: `Can you find the ${pence(target)} coin?`, hint: 'Look for the number on the coin.', show: 'coin', kind: 'which-coin', answer: target, options: optionsFrom(target, pool, 3) });
    if (level === 1) {
      for (const target of shuffle([1, 2, 5, 10])) whichCoin(target, [1, 2, 5, 10]);
      for (const n of shuffle([2, 3, 4, 5])) totalItem(level, Array(n).fill(1), ['within-5p', 'pennies']);
      continue;
    }
    if (level === 2) {
      for (const target of shuffle([20, 50, 100, 200])) whichCoin(target, [5, 10, 20, 50, 100, 200]);
      for (const n of shuffle([6, 7, 8, 9, 10])) totalItem(level, Array(n).fill(1), ['within-10p', 'pennies']);
      continue;
    }
    if (level === 3) {
      for (const coins of sample(bags([5, 2, 1], 2, 5, 10), 14, (b) => b.join('+'))) totalItem(level, coins, ['within-10p']);
      continue;
    }
    if (level === 4) {
      for (const coins of sample(bags([10, 5, 2, 1], 2, 3, 20), 14, (b) => b.join('+'))) totalItem(level, coins, ['within-20p']);
      continue;
    }
    const changeFrom = (paid: number, prices: number[], n: number) => {
      for (const price of sample(prices, n, String)) {
        const [emoji, thing] = pick(SHOP);
        const answer = paid - price;
        const say = `The ${thing} costs ${pence(price)}. You pay with a ${pence(paid)} coin. How much change do you get?`;
        const hint = `Start at ${word(price)} and count up to ${word(paid)}.`;
        const options = numOptions(answer, OPTIONS_PER_LEVEL[level], 1, paid, [price, answer + 1]);
        items.push({ id: nextId('money', level), topic: 'money', level, skill: 'change', tags: [`change-from-${paid}p`], say, hint, show: 'pence', kind: 'change', paid, price, emoji, answer, options });
      }
    };
    if (level === 5) {
      changeFrom(10, range(1, 9), 8);
      for (const coins of sample(bags([10, 5], 2, 4, 30), 6, (b) => b.join('+'))) totalItem(level, coins, ['within-30p', 'count-in-5s-10s']);
      continue;
    }
    changeFrom(20, range(11, 19), 7);
    for (const coins of sample(bags([50, 20, 10], 2, 3, 100), 9, (b) => b.join('+'))) totalItem(level, coins, ['within-100p', 'count-in-10s']);
  }

  // Clocks
  const t = (h: number, m: number) => `${h}:${m === 0 ? '00' : '30'}`;
  const wrap = (h: number) => ((h - 1 + 12) % 12) + 1;
  const hours = range(1, 12);
  const spoken = (h: number, m: number) => (m === 0 ? `${word(h)} o'clock` : `half past ${word(h)}`);
  for (const level of LEVELS) {
    const n = level === 6 ? 16 : 12;
    // Level 6 starts from o'clock and from half past, so an hour can come twice without repeating a question.
    const slots = level === 6 ? shuffle(hours.flatMap((h) => [[h, 0], [h, 30]])).slice(0, n) : shuffle(hours).slice(0, n).map((h) => [h, 0]);
    for (const [i, [h, startM]] of slots.entries()) {
      const count = OPTIONS_PER_LEVEL[level];
      if (level === 1) {
        const options = shuffle([t(h, 0), ...shuffle(hours.filter((x) => x !== h)).slice(0, count - 1).map((x) => t(x, 0))]);
        items.push({ id: nextId('clock', level), topic: 'clock', level, skill: 'o-clock', tags: ['find-face'], say: `Can you find ${spoken(h, 0)}?`, hint: 'The long hand points straight up. The short hand shows the hour.', show: 'clock', kind: 'find', answer: t(h, 0), options });
      } else if (level === 2 || (level === 4 && i % 2)) {
        const half = level === 4;
        const options = numOptions(h, count, 1, 12, half ? [wrap(h + 1)] : [12 === h ? 6 : 12]);
        items.push({ id: nextId('clock', level), topic: 'clock', level, skill: half ? 'half-past' : 'o-clock', tags: ['read-face'], say: half ? 'It is half past. Half past what?' : "What o'clock is it?", hint: half ? 'The short hand has just gone past the hour. Which number did it pass?' : 'Look where the short hand points.', show: 'numeral', kind: 'read', time: t(h, half ? 30 : 0), answer: h, options });
      } else if (level === 3) {
        const options = shuffle([t(h, 30), t(h, 0), t(wrap(h + 1), 30)]);
        items.push({ id: nextId('clock', level), topic: 'clock', level, skill: 'half-past', tags: ['find-face', 'misconception:hour-after'], say: `Can you find ${spoken(h, 30)}?`, hint: 'Half past: the long hand points down to the six.', show: 'clock', kind: 'find', answer: t(h, 30), options });
      } else {
        const earlier = level === 5 && i % 2 === 1;
        const minutes: 30 | 60 = level === 6 ? 30 : 60;
        const m = startM;
        const from = t(h, m);
        const answerH = minutes === 60 ? wrap(earlier ? h - 1 : h + 1) : m === 30 ? wrap(h + 1) : h;
        const answerM = minutes === 60 ? 0 : m === 30 ? 0 : 30;
        const answer = t(answerH, answerM);
        const pool = minutes === 60 ? [t(wrap(answerH + (earlier ? -1 : 1)), 0), t(h, 0), t(wrap(answerH + (earlier ? 1 : -1) * 2), 0), t(answerH, 30), t(wrap(h + 3), 0)] : [t(h, 0), t(h, 30), t(wrap(h + 1), 0), t(wrap(h + 1), 30), t(wrap(h - 1), 30), t(wrap(h + 2), 0)];
        const options = shuffle([answer, ...shuffle([...new Set(pool)].filter((x) => x !== answer)).slice(0, count - 1)]);
        const say = minutes === 60 ? `It is ${spoken(h, m)}. What time will it be ${earlier ? 'one hour ago' : 'in one hour'}?`.replace('What time will it be one hour ago', 'What time was it one hour ago') : `It is ${spoken(h, m)}. What time will it be in half an hour?`;
        const hint = minutes === 60 ? `Move the short hand ${earlier ? 'back' : 'on'} one number.` : 'Half an hour: the long hand goes halfway round.';
        items.push({ id: nextId('clock', level), topic: 'clock', level, skill: minutes === 60 ? (earlier ? 'hour-earlier' : 'hour-later') : 'half-hour-later', tags: [minutes === 60 ? 'o-clock' : 'half-past', 'elapsed'], say, hint, show: 'clock', kind: earlier ? 'earlier' : 'later', from, minutes, answer, options });
      }
    }
  }

  // Queues: first, second, third
  const ANIMALS = ['🦊', '🐰', '🐻', '🐸', '🦉', '🐷', '🐮', '🐱', '🐶', '🐭', '🦔', '🐢'];
  const ANIMAL_NAME: Record<string, string> = { '🦊': 'fox', '🐰': 'rabbit', '🐻': 'bear', '🐸': 'frog', '🦉': 'owl', '🐷': 'pig', '🐮': 'cow', '🐱': 'cat', '🐶': 'dog', '🐭': 'mouse', '🦔': 'hedgehog', '🐢': 'tortoise' };
  const ordPlan: Record<BankLevel, { len: number; positions: number[]; from: ('front' | 'back')[]; where?: boolean }> = {
    1: { len: 3, positions: [1, 3], from: ['front'] },
    2: { len: 4, positions: [1, 2, 4], from: ['front'] },
    3: { len: 5, positions: [1, 2, 3, 5], from: ['front'] },
    4: { len: 6, positions: [2, 3, 4, 5], from: ['front'] },
    5: { len: 6, positions: [2, 3, 4], from: ['back'] },
    6: { len: 7, positions: [2, 3, 4, 5, 6, 7], from: ['front'], where: true },
  };
  for (const level of LEVELS) {
    const plan = ordPlan[level];
    for (let k = 0; k < 12; k++) {
      const line = shuffle(ANIMALS).slice(0, plan.len);
      if (plan.where) {
        const answer = plan.positions[k % plan.positions.length];
        const target = line[answer - 1];
        const options = numOptions(answer, OPTIONS_PER_LEVEL[level], 1, plan.len, [plan.len + 1 - answer]);
        items.push({ id: nextId('ordinal', level), topic: 'ordinal', level, skill: 'ordinal-place', tags: ['to-seventh', 'misconception:count-from-back'], say: `The animals are queuing for the slide. Which place in the queue is the ${ANIMAL_NAME[target]}?`, hint: 'Start at the front and count along.', show: 'numeral', kind: 'where', line, target, answer, options });
        continue;
      }
      const from = plan.from[k % plan.from.length];
      const position = plan.positions[Math.floor(k / plan.from.length) % plan.positions.length];
      const answer = from === 'front' ? line[position - 1] : line[line.length - position];
      const last = from === 'front' && position === plan.len;
      const phrase = last ? 'last' : from === 'back' ? `${ORDINALS[position]} from the back` : ORDINALS[position];
      const mirror = from === 'front' ? line[line.length - position] : line[position - 1];
      const pool = [mirror, ...line].filter((x, i, arr) => arr.indexOf(x) === i && x !== answer);
      const options = shuffle([answer, ...[pool[0], ...shuffle(pool.slice(1))].slice(0, OPTIONS_PER_LEVEL[level] - 1)]);
      items.push({ id: nextId('ordinal', level), topic: 'ordinal', level, skill: from === 'back' ? 'ordinal-from-back' : 'ordinal', tags: [last ? 'last' : `position:${position}`], say: `The animals are queuing for the slide. Who is ${phrase}?`, hint: from === 'back' ? 'Start at the back of the queue this time.' : 'Start at the front and count along.', show: 'emoji', kind: 'which', line, position: last ? plan.len : position, from, answer, options });
    }
  }
}

build();
writeFileSync(OUT, `[\n${items.map((i) => JSON.stringify(i)).join(',\n')}\n]\n`);
console.log(`wrote ${items.length} items to ${OUT}`);
