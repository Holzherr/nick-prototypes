import type { Meta, StoryObj } from '@storybook/react-vite';
import { thisOldMan as piece } from '@/features/score/pieces/this-old-man.ts';
import { Keyboard } from './Keyboard.tsx';

const meta = {
  title: 'Keyboard/Keyboard',
  component: Keyboard,
  args: { piece, onPress: () => {} },
} satisfies Meta<typeof Keyboard>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Resting position. Middle C carries a badge from each hand - both thumbs share it. */
export const Setup: Story = { args: { target: 62, next: 59 } };

/** The left hand takes over: target teal, next key outlined in amber. */
export const LeftHandTurn: Story = { args: { target: 59, next: 62 } };

/** Once she knows the keys, the letters come off. */
export const WithoutLetters: Story = { args: { target: 62, next: 59, showLetters: false } };
