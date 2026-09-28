import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GardenHome } from '@/features/games/components/GardenHome';
import { say } from '@/features/games/sound';
import { characterById, type Character, type CharacterId } from '../characters';
import { CharacterSlot } from './CharacterSlot';

vi.mock('@/features/games/sound', () => ({ say: vi.fn() }));

const nova = characterById('nova');

/** A second entry the list does not hold yet: the same slot must draw it, or "more characters later" is not true. */
const pip: Character = {
  id: 'pip' as CharacterId,
  name: 'Pip',
  stagesAt: [2, 4, 6, 8],
  lines: [(n) => `Hello ${n}, I'm Pip`, (n) => `${n} 2`, (n) => `${n} 3`, (n) => `${n} 4`, (n) => `${n} 5`],
  Art: ({ stage, size }) => <svg data-testid="pip-art" data-stage={stage} width={size} height={size} aria-hidden />,
};

describe('CharacterSlot', () => {
  it('shows the character as a tap target with nothing to read, and speaks her line for the stage when tapped', () => {
    render(<CharacterSlot character={nova} rounds={nova.stagesAt[1]} childName="Ada" />);

    const slot = screen.getByRole('button', { name: nova.name });
    expect(slot.textContent).toBe('');
    expect(slot.querySelector('svg')).not.toBeNull();
    fireEvent.click(slot);
    expect(say).toHaveBeenCalledWith(nova.lines[2]('Ada'));
  });

  it('renders a second character entry through the same slot, at that character’s own stage', () => {
    render(<CharacterSlot character={pip} rounds={4} childName="Ada" />);

    expect(screen.getByTestId('pip-art')).toHaveAttribute('data-stage', '3');
    fireEvent.click(screen.getByRole('button', { name: 'Pip' }));
    expect(say).toHaveBeenCalledWith('Ada 3');
  });

  it('stands on the home screen beside the garden', () => {
    render(<GardenHome childName="Ada" levels={{}} stickerCount={0} character={nova} rounds={0} onPlay={vi.fn()} onStickers={vi.fn()} onGrownUps={vi.fn()} />);

    expect(screen.getByRole('button', { name: nova.name })).toBeInTheDocument();
  });
});
