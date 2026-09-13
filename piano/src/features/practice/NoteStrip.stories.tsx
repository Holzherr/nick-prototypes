import type { Meta, StoryObj } from '@storybook/react-vite';
import { thisOldMan as piece } from '@/features/score/pieces/this-old-man.ts';
import { NoteStrip } from './NoteStrip.tsx';

const meta = {
  title: 'Practice/NoteStrip',
  component: NoteStrip,
  args: { piece, onSelect: () => {} },
} satisfies Meta<typeof NoteStrip>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Start: Story = { args: { current: 0, played: piece.notes.map(() => false) } };
export const HalfDone: Story = {
  args: { current: 15, played: piece.notes.map((_, i) => i < 15) },
};
