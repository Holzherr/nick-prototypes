import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SKILLS } from '@/features/curriculum/skills';
import { packFromParams, packLink } from './pack';
import { PackScreen } from './PackScreen';

/**
 * The stage pack renders every sheet at once, so a generator that can't find enough questions would hang
 * the whole page (it did once). Rendering it here is the guard.
 */
describe('stage pack', () => {
  it('round-trips through its link', () => {
    const options = {
      name: 'Tara',
      icon: '🦄',
      stages: { subitising: 2, counting: 1, numerals: 3, comparison: 2, adding: 1, bonds: 2, subtracting: 1, teens: 3, rote: 2 } as const,
    };
    expect(packFromParams(new URLSearchParams(packLink(options).split('?')[1]))).toEqual(options);
  });

  it('defaults to stage 1 when the link says nothing', () => {
    const { name, icon, stages } = packFromParams(new URLSearchParams());
    expect({ name, icon }).toEqual({ name: '', icon: '🦄' });
    // Every skill gets a stage, so this keeps up as skills are added.
    expect(Object.keys(stages)).toHaveLength(SKILLS.length);
    expect(Object.values(stages).every((stage) => stage === 1)).toBe(true);
  });

  it('builds every sheet at every stage without hanging', () => {
    for (const stage of [1, 2, 3] as const) {
      const options = packFromParams(new URLSearchParams(`name=Tara&icon=🦄&subitising=${stage}&counting=${stage}&numerals=${stage}&comparison=${stage}&adding=${stage}&rote=${stage}`));
      const { container, unmount } = render(<PackScreen options={options} />);
      // Cover page, Quick Peek cards, then a how-to page and the sheet itself for each of the five makers.
      expect(container.querySelectorAll('section').length).toBeGreaterThan(12);
      expect(container.querySelectorAll('svg[aria-label^="QR code"]').length).toBeGreaterThan(5);
      unmount();
    }
  });

  it('names the child on the pack', () => {
    render(<PackScreen options={packFromParams(new URLSearchParams('name=Tara&subitising=1&counting=1&numerals=1&comparison=1&adding=1&rote=1'))} />);
    expect(screen.getAllByText(/Tara’s stage pack/).length).toBeGreaterThan(0);
  });
});
