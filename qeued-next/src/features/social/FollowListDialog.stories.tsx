import type { Meta, StoryObj } from '@storybook/react-vite';
import { userId } from '@/features/library/fixtures';
import FollowListDialog from './FollowListDialog';

const meta = {
  title: 'Social/FollowListDialog',
  component: FollowListDialog,
  parameters: {
    docs: {
      description: {
        component: 'Wraps a "12 followers" / "3 following" count; clicking opens a dialog listing those profiles with avatars and follow buttons. Loads the list from Supabase when opened.',
      },
    },
  },
  args: { userId, type: 'followers', count: 12, children: <button className="text-sm underline">12 followers</button> },
} satisfies Meta<typeof FollowListDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Followers: Story = {};
export const Following: Story = { args: { type: 'following', count: 3, children: <button className="text-sm underline">3 following</button> } };
