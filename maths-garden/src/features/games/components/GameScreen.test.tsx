import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { gameById } from '../catalog';
import { makeRound } from '../questions';
import { GameScreen, type PausedRound } from './GameScreen';

/**
 * The 🏠 button sits at a child's fingertip and fires on one tap. It used to throw a half-finished round
 * away with no way back, so leaving now hands the whole round out and home offers to carry on.
 */
describe('leaving a round', () => {
  const game = gameById('count');
  const level = 0;
  const questions = makeRound(game.id, game.levels[level]);

  const leave = (onHome: (paused: PausedRound) => void, resume?: PausedRound) => {
    render(<GameScreen game={game} level={level} childName="Tara" questions={questions} resume={resume} onFinish={vi.fn()} onHome={onHome} />);
    fireEvent.click(screen.getByRole('button', { name: 'Home' }));
  };

  it('hands back the whole round, not just the answers', () => {
    const onHome = vi.fn();
    leave(onHome);

    expect(onHome).toHaveBeenCalledTimes(1);
    const paused = onHome.mock.calls[0][0] as PausedRound;
    expect(paused.questions).toEqual(questions);
    expect(paused.index).toBe(0);
    expect(paused.answers).toEqual([]);
  });

  it('carries on from the same question with the answers already given', () => {
    // As if she answered the first two and left on the third.
    const partway: PausedRound = {
      questions,
      index: 2,
      answers: [
        { target: 'a', chosen: 'a', correct: true, ms: 900, totalMs: 900 },
        { target: 'b', chosen: 'b', correct: false, ms: 900, totalMs: 900 },
      ],
    };
    const onHome = vi.fn();
    leave(onHome, partway);

    const paused = onHome.mock.calls[0][0] as PausedRound;
    expect(paused.index).toBe(2);
    expect(paused.answers).toHaveLength(2);
    // The same questions come back: resuming must not reshuffle the round under her.
    expect(paused.questions).toEqual(questions);
  });

  it('shows the stars already earned when resuming', () => {
    const partway: PausedRound = {
      questions,
      index: 1,
      answers: [{ target: 'a', chosen: 'a', correct: true, ms: 900, totalMs: 900 }],
    };
    render(<GameScreen game={game} level={level} childName="Tara" questions={questions} resume={partway} onFinish={vi.fn()} onHome={vi.fn()} />);

    // StarRow labels itself "<lit> of <total> stars". Matching the exact label matters: a looser pattern
    // would also match a blank row, so the test would pass even if resuming lost her stars.
    expect(screen.getByLabelText('1 of 5 stars')).toBeTruthy();
    expect(screen.queryByLabelText('0 of 5 stars')).toBeNull();
  });
});
