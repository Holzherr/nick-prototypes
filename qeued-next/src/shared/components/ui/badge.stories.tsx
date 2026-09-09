import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './badge';

const meta = {
  title: 'Shared/UI/Badge',
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: 'Pill label for genres, statuses and match scores. Variants: default (blue), secondary (grey, used for genres), destructive (red), outline (border only, used for the "Watched ✓" state).',
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 p-6">
      <Badge>92% match</Badge>
      <Badge variant="secondary">Thriller</Badge>
      <Badge variant="secondary">Drama</Badge>
      <Badge variant="outline">Watched ✓</Badge>
      <Badge variant="destructive">Dropped</Badge>
    </div>
  ),
};
