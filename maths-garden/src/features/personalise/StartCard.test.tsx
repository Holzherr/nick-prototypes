import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Child } from '@/features/children/model';
import { GUEST_CHILDREN, GUEST_FLAG } from '@/features/progress/guest';
import { readJSON } from '@/shared/utils/storage';
import { DEFAULT_THEME, readTheme } from './player';
import { StartCard } from './StartCard';
import { themeById } from './themes';

vi.mock('@/features/analytics/events', () => ({ track: vi.fn(), cleanPath: () => '/' }));

const start = () => screen.getByRole('button', { name: /start playing/i });
const field = () => screen.getByRole('textbox', { name: /name/i });

describe('starting play from the homepage', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
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

  /**
   * The icon used to be offered three ways at once — the big tile cycled on tap, a caption said so, and
   * the picker row sat below — on the screen with the fewest words on it. The picker is now the one
   * control; the tile is a preview of what it chose.
   */
  it('offers the icon one way: the picker, not the big tile', () => {
    render(<StartCard />);

    expect(screen.queryByRole('button', { name: /change your icon/i })).toBeNull();
    expect(screen.queryByText(/tap to change/i)).toBeNull();
    expect(screen.getByRole('radiogroup', { name: /pick your icon/i })).toBeInTheDocument();
  });

  it('changes the theme when a picker tile is tapped, and starts play with it', () => {
    render(<StartCard />);
    expect(readTheme()).toBe(DEFAULT_THEME);
    expect(DEFAULT_THEME).not.toBe('dragon');

    const dragon = screen.getByRole('radio', { name: 'Dragon' });
    fireEvent.click(dragon);
    expect(dragon).toHaveAttribute('aria-checked', 'true');
    expect(readTheme()).toBe('dragon');

    fireEvent.change(field(), { target: { value: 'Juniper' } });
    fireEvent.click(start());
    expect(readJSON<Child[]>(GUEST_CHILDREN, [])[0].avatar).toBe(themeById('dragon').glyph);
  });

  /**
   * The headline is "<name>'s Maths Garden" with the name typed into it, so before a name exists it read
   * "'s Maths Garden" next to an empty dashed box — a broken sentence as the first thing on the page.
   * The possessive waits for a name; the placeholder carries the line until then.
   */
  it('shows no possessive until a name is typed', () => {
    render(<StartCard />);

    expect(screen.queryByText(/s Maths Garden/)).toBeNull();
    expect(field()).toHaveAttribute('placeholder', expect.stringMatching(/your name/i));
  });

  it('reads "<name>’s Maths Garden" once a name is typed', () => {
    render(<StartCard />);
    fireEvent.change(field(), { target: { value: 'Tara' } });

    expect(screen.getByRole('heading', { name: 'Tara’s Maths Garden' })).toBeInTheDocument();
  });

  it('keeps the possessive hidden for a name of only spaces', () => {
    render(<StartCard />);
    fireEvent.change(field(), { target: { value: '   ' } });

    expect(screen.queryByText(/s Maths Garden/)).toBeNull();
  });
});
