import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from './button';

const meta = {
  title: 'Shared/UI/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'shadcn button, 40px high, rounded-md. Variants: default (blue fill, the primary action), secondary (light grey fill), outline (white with border), ghost (no chrome until hover), link (blue text), destructive (red fill). Sizes: default, sm, lg, icon.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { children: 'Get recommendations' } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3 p-6">
      <Button>
        <Sparkles /> Get recommendations
      </Button>
      <Button variant="secondary">Home</Button>
      <Button variant="outline">Filter</Button>
      <Button variant="ghost">Search</Button>
      <Button variant="link">Sign in</Button>
      <Button variant="destructive">Remove</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Add">
        <Plus />
      </Button>
    </div>
  ),
};
