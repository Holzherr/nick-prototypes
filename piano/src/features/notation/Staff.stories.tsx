import type { Meta, StoryObj } from '@storybook/react-vite';
import { thisOldMan as piece } from '@/features/score/pieces/this-old-man.ts';
import { Staff } from './Staff.tsx';

const none = piece.notes.map(() => false);
const upTo = (n: number) => piece.notes.map((_, i) => i < n);

const meta = {
  title: 'Notation/Staff',
  component: Staff,
  args: { piece, onSelect: () => {} },
} satisfies Meta<typeof Staff>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Bar 1. Notes are coloured by the hand that plays them. */
export const Start: Story = { args: { current: 0, played: none } };

/** Mid-piece: played notes fade back, the line scrolls to centre the current one. */
export const PartWayThrough: Story = { args: { current: 14, played: upTo(14) } };

/** The quaver run in bar 6, beamed in pairs. */
export const QuaverRun: Story = { args: { current: 19, played: upTo(19) } };

/** Letters off, for when she is reading the notes themselves. */
export const WithoutLetters: Story = { args: { current: 8, played: upTo(8), showLetters: false } };
