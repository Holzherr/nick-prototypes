import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { gameName } from '@/features/i18n/content';
import { gameById, GAMES } from '../catalog';
import type { BreakReason } from '../insights';
import { recommendGame } from '../recommend';
import { GardenHome, WIND_DOWN } from './GardenHome';

// The Button variants by the class that gives them their colour: pink is the one thing to tap, cream steps back.
const PRIMARY = 'bg-bubble';
const QUIET = 'bg-cream';

const recommended = recommendGame([], { peek: 1, find: 2 }, GAMES);
const base = {
  childName: 'Ada',
  levels: { peek: 1, find: 2 },
  stickerCount: 6,
  recommended,
  onPlay: vi.fn(),
  onStickers: vi.fn(),
  onGarden: vi.fn(),
  onGrownUps: vi.fn(),
};
const paused = { paused: { game: gameById('count'), answered: 2, total: 5 }, onResume: vi.fn(), onDropPaused: vi.fn() };

const primaries = () => screen.getAllByRole('button').filter((button) => button.className.includes(PRIMARY));

/**
 * After a round, home used to stack the wind-down card, "Or one more", the suggested game and its toggle: three
 * primary actions at once for a four-year-old. Now it offers one thing, and a paused round outranks it.
 */
describe('home after a round', () => {
  it('offers the garden and nothing else when winding down', () => {
    render(<GardenHome {...base} windDown="lots" />);

    expect(primaries()).toHaveLength(1);
    expect(primaries()[0]).toHaveTextContent('See my garden');
    expect(screen.queryByText(gameName(recommended.game.id))).toBeNull();
    expect(screen.queryByText(/Or pick another game/)).toBeNull();
  });

  it('lets a paused round win: Carry on is the one pink button and the garden goes quiet', () => {
    render(<GardenHome {...base} {...paused} windDown="lots" />);

    expect(primaries()).toHaveLength(1);
    expect(primaries()[0]).toHaveTextContent('Carry on');
    expect(screen.getByRole('button', { name: /See my garden/ }).className).toContain(QUIET);
  });

  it('leads with the suggested game when nothing says stop', () => {
    render(<GardenHome {...base} windDown={null} />);

    expect(screen.getByText(gameName(recommended.game.id))).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /See my garden/ })).toBeNull();
  });

  it('says why in one short line she does not have to read', () => {
    for (const reason of Object.keys(WIND_DOWN) as BreakReason[]) {
      expect(WIND_DOWN[reason].trim().split(/\s+/).length, reason).toBeLessThanOrEqual(6);
    }
    const { container } = render(<GardenHome {...base} windDown="slowing" />);
    expect(container.querySelector('section')?.querySelectorAll('p')).toHaveLength(1);
  });

  it('keeps Grown-ups in the flow, so it can never sit over the game card', () => {
    render(<GardenHome {...base} />);

    expect(screen.getByRole('button', { name: /Grown-ups/ }).className).not.toContain('fixed');
  });
});
