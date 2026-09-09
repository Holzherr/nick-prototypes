import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './skeleton';

const meta = {
  title: 'Shared/UI/Skeleton',
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component:
          'Pulsing grey block standing in for content while it loads. Size it with utility classes; the component only supplies the fill, radius and animation.',
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { className: 'h-4 w-[220px]' } };

export const RecipeCard: Story = {
  render: () => (
    <div className="w-[260px] space-y-3 p-6">
      <Skeleton className="aspect-[4/3] w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  ),
};
