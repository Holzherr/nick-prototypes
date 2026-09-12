import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GrownUpsGate, grownUpsPassed } from './GrownUpsGate';

/**
 * Passing the sum has to outlive a remount. Signing in from the grown-ups screen rebuilds the whole tree,
 * which meant a second sum to get back to the screen you were already on.
 */
describe('grown-ups gate', () => {
  // Fixed rng: between(3, 8) lands on 3 twice, so the answer is 6.
  const rng = () => 0;

  it('remembers a correct answer so the next open skips the sum', () => {
    expect(grownUpsPassed()).toBe(false);

    const onPass = vi.fn();
    render(<GrownUpsGate rng={rng} onPass={onPass} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '6' }));

    expect(onPass).toHaveBeenCalled();
    expect(grownUpsPassed()).toBe(true);
  });

  it('does not remember a wrong answer', () => {
    const onCancel = vi.fn();
    const onPass = vi.fn();
    render(<GrownUpsGate rng={rng} onPass={onPass} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: '7' }));

    expect(onCancel).toHaveBeenCalled();
    expect(onPass).not.toHaveBeenCalled();
  });
});
