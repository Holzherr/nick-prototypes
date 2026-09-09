import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';

const meta = {
  title: 'Shared/UI/Dialog',
  component: Dialog,
  parameters: {
    docs: {
      description: {
        component: 'Centred modal on a dimmed backdrop with a close cross top-right. Used for follower lists and the avatar/edit sheets on the profile.',
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Followers</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Nobody yet. Share your profile link to get followers.</p>
      </DialogContent>
    </Dialog>
  ),
};
