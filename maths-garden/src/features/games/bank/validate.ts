/**
 * Checks every question in the bank from first principles: it recomputes each answer from the question's
 * own numbers, re-reads the numbers out of the spoken sentence, and checks the options can be drawn for a
 * child who cannot read. Shares no code with the builder, so a builder bug cannot vouch for itself.
 */
import { BANK_TOPICS, OPTIONS_PER_LEVEL, UK_COINS, type BankItem, type BankLevel } from './types.ts';

// ---------- spoken numbers ----------
const UNITS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS: Record<string, number> = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const ORDINAL: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8 };

const single = (w: string): number | undefined => {
  if (w in UNITS) return UNITS[w];
  if (w in TENS) return TENS[w];
  // "counting in twos", "tens"
  if (w.endsWith('s') && (w.slice(0, -1) in UNITS || w.slice(0, -1) in TENS)) return single(w.slice(0, -1));
  const [t, u] = w.split('-');
  if (u && t in TENS && u in UNITS && UNITS[u] < 10) return TENS[t] + UNITS[u];
  return undefined;
};

/** Every number said in a sentence, in order: "twenty-nine", "one hundred", "twos". Pounds are read as pence. */
export function spokenNumbers(text: string): number[] {
  const words = text.toLowerCase().split(/[^a-z-]+/).filter(Boolean);
  const out: number[] = [];
  for (let i = 0; i < words.length; i++) {
    const n = single(words[i]);
    if (n === undefined) continue;
    if (words[i + 1] === 'hundred' || words[i + 1] === 'pound' || words[i + 1] === 'pounds') {
      out.push(n * 100);
      i++;
    } else out.push(n);
  }
  return out;
}
export const spokenOrdinals = (text: string) => text.toLowerCase().split(/[^a-z]+/).filter((w) => w in ORDINAL).map((w) => ORDINAL[w]);

// ---------- helpers ----------
const CLOCK = /^(1[0-2]|[1-9]):(00|30)$/;
const minutesOf = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return (h % 12) * 60 + m;
};
const clockOf = (mins: number) => {
  const m = ((mins % 720) + 720) % 720;
  const h = Math.floor(m / 60) || 12;
  return `${h}:${m % 60 === 0 ? '00' : '30'}`;
};
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
/** Any letter or digit means a child would have to read it. */
const READABLE = /[A-Za-z0-9]/;
/** Film, TV and brand characters the goals rule out. */
const BRANDS = /\b(disney|frozen|elsa|anna|olaf|peppa|george pig|bluey|paw patrol|pokemon|pikachu|lego|barbie|mickey|minnie|spongebob|hello kitty|cocomelon|kpop|k-pop|marvel|spider-?man)\b/i;

/** Largest number a question may use or ask for, per topic and level: the stage's range, with some room for the challenge levels. */
const CEILING: Record<string, Record<BankLevel, number>> = {
  story: { 1: 5, 2: 5, 3: 10, 4: 10, 5: 20, 6: 20 },
  sequence: { 1: 5, 2: 10, 3: 10, 4: 20, 5: 20, 6: 100 },
  double: { 1: 6, 2: 10, 3: 10, 4: 12, 5: 20, 6: 20 },
  money: { 1: 10, 2: 200, 3: 10, 4: 20, 5: 30, 6: 100 },
  pattern: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 100 },
  ordinal: { 1: 3, 2: 4, 3: 5, 4: 6, 5: 6, 6: 8 },
  clock: { 1: 12, 2: 12, 3: 12, 4: 12, 5: 12, 6: 12 },
};

/** Smallest period of a row, or 0 if it never repeats inside the row (needs two full repeats to count). */
function period(row: string[]): number {
  for (let p = 1; p * 2 <= row.length; p++) if (row.every((x, i) => x === row[i % p])) return p;
  return 0;
}

/**
 * What the sentence must say (`need`), what it may also say (`may`), and the answer the question's own
 * numbers give. Throws on a shape it does not know, so a new kind cannot slip through unchecked.
 */
function expect(item: BankItem): { answer: number | string; need: number[]; may: number[]; ceiling: number[] } {
  switch (item.topic) {
    case 'story': {
      const { op, a, b } = item;
      const answer = op === 'add' ? a + b : op === 'take' ? a - b : op === 'missing' ? b - a : a - b;
      return { answer, need: [a, b], may: [], ceiling: [a, b, answer, op === 'add' ? a + b : a] };
    }
    case 'pattern': {
      if (item.kind === 'repeat') return { answer: item.unit[item.row.indexOf(null) % item.unit.length], need: [], may: [], ceiling: [] };
      const blank = item.row.indexOf(null);
      return { answer: item.start + blank * item.step, need: [Math.abs(item.step)], may: [item.row[0] ?? -1], ceiling: [...item.row.filter((x): x is number => x !== null), item.start + blank * item.step] };
    }
    case 'sequence': {
      const shown = item.row.filter((x): x is number => x !== null);
      const i = item.row.indexOf(null);
      const known = item.row.findIndex((x) => x !== null);
      const step = shown.length > 1 ? (shown[1] - shown[0]) / (item.row.indexOf(shown[1]) - item.row.indexOf(shown[0])) : 1;
      const answer = (item.row[known] as number) + (i - known) * step;
      const need = item.kind === 'missing' ? [] : item.kind === 'before' ? [shown[0]] : step < 0 ? shown : [shown[shown.length - 1]];
      return { answer, need, may: [], ceiling: [...shown, answer] };
    }
    case 'double': {
      if ('a' in item) return { answer: item.a + item.b, need: item.kind === 'double' ? [item.a] : [item.a, item.b], may: item.kind === 'double' ? [2] : [], ceiling: [item.a + item.b] };
      return { answer: item.total / item.groups, need: item.kind === 'share' ? [item.total, item.groups] : [item.total], may: [2], ceiling: [item.total] };
    }
    case 'money': {
      if (item.kind === 'which-coin') return { answer: item.answer, need: [item.answer], may: [], ceiling: [item.answer] };
      if (item.kind === 'total') return { answer: sum(item.coins), need: [], may: [], ceiling: [sum(item.coins)] };
      return { answer: item.paid - item.price, need: [item.price, item.paid], may: [], ceiling: [item.paid] };
    }
    case 'clock': {
      if (item.kind === 'find') return { answer: item.answer, need: [Number(item.answer.split(':')[0])], may: [], ceiling: [] };
      if (item.kind === 'read') return { answer: Number(item.time.split(':')[0]), need: [], may: [], ceiling: [] };
      const answer = clockOf(minutesOf(item.from) + (item.kind === 'later' ? item.minutes : -item.minutes));
      return { answer, need: [Number(item.from.split(':')[0])], may: item.minutes === 60 ? [1] : [], ceiling: [] };
    }
    case 'ordinal': {
      if (item.kind === 'where') return { answer: item.line.indexOf(item.target) + 1, need: [], may: [], ceiling: [item.line.length] };
      return { answer: item.from === 'front' ? item.line[item.position - 1] : item.line[item.line.length - item.position], need: [], may: [], ceiling: [item.line.length] };
    }
  }
  throw new Error(`unknown item ${(item as BankItem).id}`);
}

export interface BankReport {
  errors: string[];
  counts: Record<string, Record<number, number>>;
  total: number;
}

export function validateBank(bank: readonly BankItem[]): BankReport {
  const errors: string[] = [];
  const fail = (item: BankItem, msg: string) => errors.push(`${item.id}: ${msg}`);
  const ids = new Set<string>();
  const content = new Set<string>();
  const counts: Record<string, Record<number, number>> = {};
  const positions: Record<string, number[]> = {};

  for (const item of bank) {
    // identity
    if (ids.has(item.id)) fail(item, 'duplicate id');
    ids.add(item.id);
    if (!BANK_TOPICS.includes(item.topic)) fail(item, `unknown topic ${item.topic}`);
    if (![1, 2, 3, 4, 5, 6].includes(item.level)) fail(item, `bad level ${item.level}`);
    if (!new RegExp(`^${item.topic}-${item.level}-\\d{2,}$`).test(item.id)) fail(item, 'id does not match topic and level');
    if (!item.skill || !Array.isArray(item.tags)) fail(item, 'missing skill or tags');
    (counts[item.topic] ??= {})[item.level] = (counts[item.topic][item.level] ?? 0) + 1;

    // the answer
    let exp: ReturnType<typeof expect>;
    try {
      exp = expect(item);
    } catch (e) {
      fail(item, String(e));
      continue;
    }
    if (exp.answer !== item.answer) fail(item, `answer ${item.answer} but the question gives ${exp.answer}`);
    if (typeof exp.answer === 'number' && (!Number.isInteger(exp.answer) || exp.answer < 0)) fail(item, `answer ${exp.answer} is not a whole number`);

    // options
    const options = item.options as (number | string)[];
    if (options.length !== OPTIONS_PER_LEVEL[item.level]) fail(item, `${options.length} options, level ${item.level} shows ${OPTIONS_PER_LEVEL[item.level]}`);
    if (new Set(options).size !== options.length) fail(item, 'duplicate options');
    if (options.filter((o) => o === item.answer).length !== 1) fail(item, 'answer is not among the options exactly once');
    (positions[item.topic] ??= Array(6).fill(0))[options.indexOf(item.answer)]++;
    for (const o of options) {
      const ok =
        item.show === 'numeral' || item.show === 'pence' ? typeof o === 'number' && Number.isInteger(o) && o >= 0
        : item.show === 'coin' ? typeof o === 'number' && UK_COINS.includes(o)
        : item.show === 'clock' ? typeof o === 'string' && CLOCK.test(o)
        : typeof o === 'string' && o.length > 0 && !READABLE.test(o);
      if (!ok) fail(item, `option ${o} cannot be drawn as ${item.show}`);
    }
    // Early levels: one wrong answer should be a near miss, the mistake worth catching.
    if (typeof item.answer === 'number' && item.show !== 'coin' && item.level <= 3) {
      const near = options.some((o) => o !== item.answer && Math.abs((o as number) - (item.answer as number)) <= 2);
      if (!near) fail(item, 'no near-miss distractor');
    }

    // topic structure
    switch (item.topic) {
      case 'story':
        if (item.a < 1 || item.b < 1) fail(item, 'story numbers must be at least one');
        if ((item.op === 'take' || item.op === 'compare') && item.b >= item.a) fail(item, 'takes away everything or more');
        if (item.op === 'missing' && item.b <= item.a) fail(item, 'nothing missing');
        break;
      case 'pattern': {
        const blanks = item.row.filter((x) => x === null).length;
        if (blanks !== 1) fail(item, `${blanks} gaps in the row`);
        const blank = item.row.indexOf(null);
        if (item.kind === 'repeat') {
          if (item.row.some((x, i) => x !== null && x !== item.unit[i % item.unit.length])) fail(item, 'row does not follow its unit');
          if (period(item.unit) !== 0 && period(item.unit) < item.unit.length) fail(item, 'unit is itself a repeat');
          // The gap must have a whole unit before it, and only the answer may complete the row as a pattern.
          if (blank < item.unit.length) fail(item, 'gap comes before one whole unit is shown');
          if (blank === item.row.length - 1 && blank < item.unit.length * 2) fail(item, 'fewer than two repeats before "what comes next"');
          for (const o of item.options) {
            const filled = item.row.map((x) => x ?? o);
            const p = period(filled);
            if (o === item.answer && p !== item.unit.length) fail(item, `answer does not complete the pattern (period ${p})`);
            if (o !== item.answer && p !== 0) fail(item, `wrong option ${o} also makes a pattern`);
          }
        } else {
          if (item.row.some((x, i) => x !== null && x !== item.start + i * item.step)) fail(item, 'row does not count in its step');
          if (item.row.some((x) => x !== null && x < 0)) fail(item, 'negative number');
        }
        break;
      }
      case 'sequence': {
        const shown = item.row.filter((x): x is number => x !== null);
        if (item.row.filter((x) => x === null).length !== 1) fail(item, 'not exactly one gap');
        const full = item.row.map((x) => x ?? (exp.answer as number));
        const step = full.length > 1 ? full[1] - full[0] : 1;
        if (Math.abs(step) !== 1 || full.some((x, i) => x !== full[0] + i * step)) fail(item, 'track does not count in ones');
        if (item.kind === 'before' && item.row[0] !== null) fail(item, '"before" gap is not at the start');
        if (item.kind === 'after' && item.row[item.row.length - 1] !== null) fail(item, '"after" gap is not at the end');
        if (item.kind === 'missing' && (item.row[0] === null || item.row[item.row.length - 1] === null)) fail(item, '"missing" gap is at an end');
        if (shown.some((x) => x < 0)) fail(item, 'negative number');
        break;
      }
      case 'double':
        if ((item.kind === 'double' && item.a !== item.b) || (item.kind === 'near-double' && item.b !== item.a + 1)) fail(item, 'not a double');
        if ((item.kind === 'half' || item.kind === 'share') && (item.total % item.groups !== 0 || (item.kind === 'half' && item.groups !== 2))) fail(item, 'does not share fairly');
        break;
      case 'money':
        if (item.kind === 'which-coin' && !UK_COINS.includes(item.answer)) fail(item, 'not a UK coin');
        if (item.kind === 'total' && item.coins.some((c) => !UK_COINS.includes(c))) fail(item, 'not a UK coin');
        if (item.kind === 'change' && (!UK_COINS.includes(item.paid) || item.price >= item.paid || item.price < 1)) fail(item, 'change does not make sense');
        if (item.kind === 'which-coin' && item.show !== 'coin') fail(item, 'coin question shows no coins');
        break;
      case 'clock':
        if (item.kind === 'read' && !CLOCK.test(item.time)) fail(item, `bad time ${item.time}`);
        if ((item.kind === 'later' || item.kind === 'earlier') && !CLOCK.test(item.from)) fail(item, `bad time ${item.from}`);
        if (item.kind === 'read' && item.options.some((o) => o < 1 || o > 12)) fail(item, 'hour option off the clock');
        break;
      case 'ordinal': {
        if (new Set(item.line).size !== item.line.length) fail(item, 'the queue has twins');
        if (item.line.some((x) => READABLE.test(x))) fail(item, 'queue is not pictures');
        if (item.kind === 'which') {
          const said = spokenOrdinals(item.say);
          const last = /\blast\b/.test(item.say);
          if (item.from === 'front' && !last && said[0] !== item.position) fail(item, `says ${said[0]}, position is ${item.position}`);
          if (item.from === 'front' && last && item.position !== item.line.length) fail(item, 'says last, is not last');
          if (item.from === 'back' && (said[0] !== item.position || !/from the back/.test(item.say))) fail(item, 'from-the-back wording');
          if (item.options.some((o) => !item.line.includes(o))) fail(item, 'option not in the queue');
        } else if (item.options.some((o) => o < 1 || o > item.line.length)) fail(item, 'place off the end of the queue');
        break;
      }
    }

    // the level's range
    const ceiling = CEILING[item.topic][item.level];
    for (const n of exp.ceiling) if (n > ceiling) fail(item, `uses ${n}, level ${item.level} ${item.topic} stops at ${ceiling}`);

    // what is spoken
    for (const [field, text] of [['say', item.say], ['hint', item.hint]] as const) {
      if (!text || text.length > (field === 'say' ? 160 : 90)) fail(item, `${field} empty or too long`);
      if (/\d/.test(text)) fail(item, `${field} has digits; the voice needs words`);
      if (BRANDS.test(text)) fail(item, `${field} names a brand character`);
    }
    if (!item.say.trim().endsWith('?')) fail(item, 'say is not a question');
    const said = spokenNumbers(item.say);
    for (const n of exp.need) if (!said.includes(n)) fail(item, `say leaves out ${n}`);
    for (const n of said) if (!exp.need.includes(n) && !exp.may.includes(n)) fail(item, `say mentions ${n}, which is not in the question`);
    if (typeof item.answer === 'number' && !exp.need.includes(item.answer) && !exp.may.includes(item.answer)) {
      if (said.includes(item.answer)) fail(item, 'say gives the answer away');
      if (spokenNumbers(item.hint).includes(item.answer)) fail(item, 'hint gives the answer away');
    }

    // no two questions the same
    const { id: _id, options: _o, hint: _h, ...rest } = item as BankItem & Record<string, unknown>;
    const key = JSON.stringify(rest);
    if (content.has(key)) fail(item, 'same question as another item');
    content.add(key);
  }

  // Tapping the same button every time must not pay.
  for (const [topic, pos] of Object.entries(positions)) {
    const n = sum(pos);
    const worst = Math.max(...pos);
    if (n >= 30 && worst / n > 0.45) errors.push(`${topic}: ${Math.round((worst / n) * 100)}% of answers sit in the same slot`);
  }

  return { errors, counts, total: bank.length };
}
