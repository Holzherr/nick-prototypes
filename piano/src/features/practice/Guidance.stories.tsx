import type { Meta, StoryObj } from '@storybook/react-vite';
import { guidance } from '@/features/score/music.ts';
import { thisOldMan as piece } from '@/features/score/pieces/this-old-man.ts';
import { Guidance } from './Guidance.tsx';

const meta = {
  title: 'Practice/Guidance',
  component: Guidance,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Guidance>;
export default meta;

type Story = StoryObj<typeof meta>;
const at = (i: number) => ({ text: guidance(piece, i), note: piece.notes[i] });

/** The very first note names the finger. */
export const FirstNote: Story = { args: at(0) };

/** A hand swap is called out explicitly - the hardest part of this piece. */
export const HandSwap: Story = { args: at(1) };

/** A step within one hand is given as a distance, not a verdict. */
export const StepWithinHand: Story = { args: at(7) };

/** A repeated key. */
export const SameKeyAgain: Story = { args: at(16) };

/** A quaver, in the teacher's own wording. */
export const HalfACount: Story = { args: at(15) };
