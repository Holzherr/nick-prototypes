import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mulberry32 as seeded } from '@/shared/utils/random';
import { gameById } from '../catalog';
import { makeRound, type BankQuestion } from '../questions';
import { QuestionView } from './QuestionView';

vi.mock('../sound', async (importActual) => ({ ...(await importActual<typeof import('../sound')>()), say: vi.fn() }));
const { say } = await import('../sound');

/** Eight items of both bank games at every level, so each `show` kind they use is rendered. */
const everyQuestion = (): BankQuestion[] =>
  (['pattern', 'sequence'] as const).flatMap((id) => gameById(id).levels.flatMap((level) => makeRound(id, level, seeded(1), 8) as BankQuestion[]));

describe('a question-bank question', () => {
  beforeEach(() => vi.mocked(say).mockClear());

  it('draws pictures and numerals, speaks the question, and shows no words for her to read', () => {
    const shown = new Set<string>();
    for (const q of everyQuestion()) {
      shown.add(q.show);
      const { container, unmount } = render(<QuestionView question={q} chosen={null} onAnswer={vi.fn()} />);
      expect(say).toHaveBeenLastCalledWith(q.say);
      expect(container.textContent).not.toMatch(/[A-Za-z]/);
      for (const option of q.options) expect(screen.getAllByRole('button', { name: String(option) }).length).toBeGreaterThan(0);
      unmount();
    }
    expect([...shown].sort()).toEqual(['emoji', 'numeral']);
  });

  it('says it again from the 🔊 button, and answers with the option tapped', () => {
    const onAnswer = vi.fn();
    const q: BankQuestion = { game: 'pattern', item: 'pattern-1-01', say: 'What comes next?', show: 'emoji', row: ['🍇', '🍌', '🍇', '🍌', null], answer: '🍇', options: ['🍌', '🍇', '🍐'] };
    render(<QuestionView question={q} chosen={null} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByRole('button', { name: 'Hear it again' }));
    expect(say).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('button', { name: '🍇' }));
    expect(onAnswer).toHaveBeenCalledWith('🍇');
  });
});
