import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Child } from '@/features/children/model';
import { GUEST_CHILDREN, GUEST_FLAG } from '@/features/progress/guest';
import { readJSON } from '@/shared/utils/storage';
import { StartCard } from './StartCard';

vi.mock('@/features/analytics/events', () => ({ track: vi.fn(), cleanPath: () => '/' }));

const start = () => screen.getByRole('button', { name: /start playing/i });
const field = () => screen.getByRole('textbox', { name: /name/i });
// The catalogue spells the possessive with a typographic apostrophe; accept either so the test does not
// hinge on which one the string holds.
const possessive = /['’]s Maths Garden/;

describe('starting play from the homepage', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  /**
   * Before a name exists the heading used to read "'s Maths Garden" next to an empty dashed box: a broken
   * sentence as the first thing on the front door. The possessive belongs to a name, so it only appears
   * once there is one.
   */
  it('hides the possessive until a name is typed', () => {
    render(<StartCard />);
    expect(screen.queryByText(possessive)).not.toBeInTheDocument();

    fireEvent.change(field(), { target: { value: 'Tara' } });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(possessive);
    expect(field()).toHaveValue('Tara');
  });

  it('keeps the possessive hidden for a name of only spaces', () => {
    render(<StartCard />);
    fireEvent.change(field(), { target: { value: '   ' } });

    expect(screen.queryByText(possessive)).not.toBeInTheDocument();
  });

  /**
   * "Start playing" with an empty name used to look like a dead button: the only sign anything had
   * happened was a line of text below the icon row, which on a laptop is not on screen at the same time
   * as the button you just pressed. Nothing moved, nothing focused, and the field it was about was in
   * the heading above.
   */
  it('says what is wrong and puts the cursor in the field', () => {
    render(<StartCard />);
    fireEvent.click(start());

    expect(screen.getByRole('alert')).toHaveTextContent(/type a name first/i);
    expect(field()).toHaveFocus();
    expect(field()).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not start a guest without a name', () => {
    render(<StartCard />);
    fireEvent.click(start());

    expect(readJSON<Child[]>(GUEST_CHILDREN, [])).toHaveLength(0);
    expect(readJSON(GUEST_FLAG, false)).toBe(false);
    expect(window.location.hash).not.toContain('/app');
  });

  it('treats a name of only spaces as no name', () => {
    render(<StartCard />);
    fireEvent.change(field(), { target: { value: '   ' } });
    fireEvent.click(start());

    expect(screen.getByRole('alert')).toHaveTextContent(/type a name first/i);
    expect(readJSON<Child[]>(GUEST_CHILDREN, [])).toHaveLength(0);
  });

  it('clears the complaint as soon as they start typing', () => {
    render(<StartCard />);
    fireEvent.click(start());
    expect(field()).toHaveAttribute('aria-invalid', 'true');

    fireEvent.change(field(), { target: { value: 'R' } });
    expect(field()).toHaveAttribute('aria-invalid', 'false');
  });

  it('starts play with a name, and needs no icon chosen first', () => {
    render(<StartCard />);
    fireEvent.change(field(), { target: { value: 'Juniper' } });
    fireEvent.click(start());

    const children = readJSON<Child[]>(GUEST_CHILDREN, []);
    expect(children).toHaveLength(1);
    expect(children[0].name).toBe('Juniper');
    expect(window.location.hash).toContain('/app');
  });
});
