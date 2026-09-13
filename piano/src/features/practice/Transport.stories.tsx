import type { Meta, StoryObj } from '@storybook/react-vite';
import { Transport } from './Transport.tsx';

const noop = () => {};
const meta = {
  title: 'Practice/Transport',
  component: Transport,
  args: {
    playing: false, bpm: 76, showScore: true, showLetters: true, soundOn: true,
    onPrev: noop, onNext: noop, onHear: noop, onPlayAlong: noop, onRestart: noop,
    onBpm: noop, onToggleScore: noop, onToggleLetters: noop, onToggleSound: noop,
  },
} satisfies Meta<typeof Transport>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = {};
export const PlayingAlong: Story = { args: { playing: true } };
/** Slowed right down for learning, letters off. */
export const SlowAndBare: Story = { args: { bpm: 44, showLetters: false } };
