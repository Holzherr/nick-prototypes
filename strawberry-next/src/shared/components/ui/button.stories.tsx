import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, Share2, Trash2 } from 'lucide-react';
import { Button } from './button';

const meta = {
  title: 'Shared/UI/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'shadcn button, greyscale. Variants: default (near-black fill — the one primary action per screen), secondary (light grey fill), outline (hairline border on white), ghost (fill only on hover), link (underline on hover), destructive (the one red the app allows, for delete). Sizes: default 40px, sm 36px, lg 44px, icon 40px square. Icons are sized to 16px automatically.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: 'Publish recipe' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3 p-6">
      <Button>Save to box</Button>
      <Button variant="secondary">Add all to list</Button>
      <Button variant="outline">Save as draft</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="link">View profile</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3 p-6">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" variant="outline" aria-label="Add ingredient">
        <Plus />
      </Button>
      <Button size="icon" variant="ghost" aria-label="Share">
        <Share2 />
      </Button>
      <Button size="icon" variant="ghost" aria-label="Remove">
        <Trash2 />
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { children: 'Publish recipe', disabled: true },
};
