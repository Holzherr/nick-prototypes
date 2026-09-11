import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SPECIAL_PACK } from '../catalog';
import { NovaAvatar, NovaCelebration } from './NovaCelebration';

const meta = {
  title: 'Stickers/Nova',
  component: NovaCelebration,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Nova, the original K-pop star character who turns up at milestones (5/10/20… stickers, a finished or sparkly-finished pack, level 3 or 5 in a game). Dimmed screen, cream card with her avatar breaking out of the top, her line, then a gift button; opening shows a gold special sticker with a burst.',
      },
    },
  },
  args: { childName: 'Tara', line: "Wow, Tara! You've got 20 stickers!", reward: null, onOpen: fn(), onClose: fn() },
} satisfies Meta<typeof NovaCelebration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gift: Story = {};
export const Opened: Story = { args: { line: 'Tara, you collected the whole Unicorns pack!', reward: { sticker: SPECIAL_PACK.stickers[0], sparkly: false } } };
export const Avatar: Story = {
  render: () => (
    <div className="flex gap-6 p-8">
      <NovaAvatar size={64} />
      <NovaAvatar size={140} />
    </div>
  ),
};
