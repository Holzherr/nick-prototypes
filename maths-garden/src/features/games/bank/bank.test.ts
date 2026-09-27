import { describe, expect, it } from 'vitest';
import bank from './question-bank.json';
import { BANK_TOPICS, type BankItem } from './types';
import { spokenNumbers, validateBank } from './validate';

const items = bank as BankItem[];

describe('question bank', () => {
  it('passes every check: answers recomputed, options drawable, sentences say the numbers asked about', () => {
    expect(validateBank(items).errors).toEqual([]);
  });

  it('has every topic at every level', () => {
    const { counts } = validateBank(items);
    for (const topic of BANK_TOPICS) for (const level of [1, 2, 3, 4, 5, 6]) expect(counts[topic]?.[level] ?? 0).toBeGreaterThanOrEqual(8);
  });

  it('catches a wrong answer and a question that gives the answer away', () => {
    const story = items.find((i) => i.topic === 'story')!;
    const wrong = { ...story, answer: (story.answer as number) + 1 } as BankItem;
    expect(validateBank([wrong]).errors.some((e) => e.includes('the question gives'))).toBe(true);
    const leaky = { ...story, hint: `It is ${['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][story.answer as number] ?? 'ten'}.` } as BankItem;
    if ((story.answer as number) <= 10) expect(validateBank([leaky]).errors.some((e) => e.includes('hint gives the answer away'))).toBe(true);
  });

  it('reads spoken numbers', () => {
    expect(spokenNumbers('Count in twos: twenty-nine, one hundred, two pounds.')).toEqual([2, 29, 100, 200]);
  });
});
