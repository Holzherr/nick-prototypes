import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GrownUpsGate, grownUpsPassed } from './GrownUpsGate';

/**
 * Passing the sum has to outlive both a remount and a reload. Signing in from the grown-ups screen rebuilds
 * the whole tree, and the screen now has a hash of its own so it can be refreshed — which is exactly what
 * caught the first version out: the pass lived in a module variable, and module state dies with the
 * document, so a refresh kept the screen but asked for the sum again.
 */
describe('grown-ups gate', () => {
  // Fixed rng: between(3, 8) lands on 3 twice, so the answer is 6 and the wrong options are 7 and 4.
  const rng = () => 0;

  beforeEach(() => sessionStorage.clear());
  afterEach(() => vi.useRealTimers());

  it('remembers a correct answer so the next open skips the sum', () => {
    expect(grownUpsPassed()).toBe(false);

    const onPass = vi.fn();
    render(<GrownUpsGate rng={rng} onPass={onPass} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '6' }));

    expect(onPass).toHaveBeenCalled();
    expect(grownUpsPassed()).toBe(true);
  });

  it('survives a reload', () => {
    render(<GrownUpsGate rng={rng} onPass={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '6' }));

    // A reload throws away every module and component, and keeps sessionStorage. Reading it back is the
    // only thing the fresh document has to go on.
    expect(sessionStorage.getItem('maths-garden:grown-ups-passed')).not.toBeNull();
    expect(grownUpsPassed()).toBe(true);
  });

  it('asks again once the ten minutes are up', () => {
    render(<GrownUpsGate rng={rng} onPass={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '6' }));
    expect(grownUpsPassed()).toBe(true);

    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 10 * 60_000 + 1);
    expect(grownUpsPassed()).toBe(false);
  });

  it('does not remember a wrong answer', () => {
    const onCancel = vi.fn();
    const onPass = vi.fn();
    render(<GrownUpsGate rng={rng} onPass={onPass} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: '7' }));

    expect(onCancel).toHaveBeenCalled();
    expect(onPass).not.toHaveBeenCalled();
    expect(grownUpsPassed()).toBe(false);
  });
});
