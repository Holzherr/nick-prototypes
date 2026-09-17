import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readTheme } from '@/features/personalise/player';
import type { Child } from '../model';
import { EditChildPanel } from './EditChildPanel';

const child: Child = { id: 'c1', name: 'Xanthe', birthdate: null, avatar: '🌸' };

const save = () => screen.getByRole('button', { name: /save changes/i });
const nameField = () => screen.getByRole('textbox', { name: /name/i });

describe('editing a child', () => {
  beforeEach(() => localStorage.clear());

  /**
   * Both the name and the picture were write-once: the profile form ran at creation and nothing led back
   * to it. A misspelt name stayed on every printable, and a picture chosen by a three-year-old was final.
   */
  it('saves a corrected name', async () => {
    const onSave = vi.fn().mockResolvedValue({});
    render(<EditChildPanel child={child} onSave={onSave} />);

    fireEvent.change(nameField(), { target: { value: 'Xanthi' } });
    fireEvent.click(save());

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Xanthi' })));
  });

  it('offers the homepage icons, which the old six-picture row did not', () => {
    render(<EditChildPanel child={child} onSave={vi.fn()} />);
    for (const glyph of ['🦄', '🏎️', '🐉', '🚀']) {
      expect(screen.getByRole('button', { name: glyph })).toBeInTheDocument();
    }
  });

  it('repaints the app when the picture is one of the themed ones', () => {
    render(<EditChildPanel child={child} onSave={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '🐉' }));
    expect(readTheme()).toBe('dragon');
  });

  it('leaves the theme alone for a picture that is only a picture', () => {
    render(<EditChildPanel child={child} onSave={vi.fn()} />);
    const before = readTheme();
    fireEvent.click(screen.getByRole('button', { name: '🦋' }));
    expect(readTheme()).toBe(before);
  });

  it('will not save until something has changed', () => {
    render(<EditChildPanel child={child} onSave={vi.fn()} />);
    expect(save()).toBeDisabled();
    fireEvent.change(nameField(), { target: { value: 'Xanthi' } });
    expect(save()).toBeEnabled();
  });

  it('refuses a blank name rather than wiping it', () => {
    const onSave = vi.fn();
    render(<EditChildPanel child={child} onSave={onSave} />);
    fireEvent.change(nameField(), { target: { value: '  ' } });
    fireEvent.click(save());
    expect(onSave).not.toHaveBeenCalled();
  });

  /** A failed save has to say so: the panel closing quietly is how an edit is silently lost. */
  it('says so when the save fails', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('offline'));
    render(<EditChildPanel child={child} onSave={onSave} />);
    fireEvent.change(nameField(), { target: { value: 'Xanthi' } });
    fireEvent.click(save());
    expect(await screen.findByText(/didn’t save/i)).toBeInTheDocument();
  });

  it('keeps a birthday that was never set as null rather than an empty string', async () => {
    const onSave = vi.fn().mockResolvedValue({});
    render(<EditChildPanel child={child} onSave={onSave} />);
    fireEvent.change(nameField(), { target: { value: 'Xanthi' } });
    fireEvent.click(save());
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ birthdate: null })));
  });
});
