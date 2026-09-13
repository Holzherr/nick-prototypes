import type { Meta, StoryObj } from '@storybook/react-vite';
import { fingersUsed, positionMap } from '@/features/score/music.ts';
import { thisOldMan as piece } from '@/features/score/pieces/this-old-man.ts';
import { HandPanel } from './HandPanel.tsx';

const meta = {
  title: 'Hands/HandPanel',
  component: HandPanel,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof HandPanel>;
export default meta;

type Story = StoryObj<typeof meta>;
const base = (hand: 'L' | 'R') => ({
  hand,
  position: positionMap(piece, hand),
  used: fingersUsed(piece, hand),
});

/** The hand that is playing right now. */
export const Playing: Story = { args: { ...base('R'), playing: 2 } };

/** The hand that takes over on the very next note - dashed, flagged, dimmed. */
export const GettingReady: Story = { args: { ...base('L'), preparing: 2 } };

/** Neither playing nor next: still on screen, so the position never leaves. */
export const Resting: Story = { args: base('L') };

/** The left hand uses four fingers in this piece; the fifth still shows its key. */
export const LeftHandPlaying: Story = { args: { ...base('L'), playing: 4 } };
