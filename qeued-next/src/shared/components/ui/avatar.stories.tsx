import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

const meta = {
  title: 'Shared/UI/Avatar',
  component: Avatar,
  parameters: {
    docs: { description: { component: 'Round 40px avatar; falls back to initials on a grey disc when there is no image.' } },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex gap-3 p-6">
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/80?img=12" alt="Nick" />
        <AvatarFallback>NH</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>PM</AvatarFallback>
      </Avatar>
    </div>
  ),
};
