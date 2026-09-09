import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator } from './separator';

const meta = {
  title: 'Shared/UI/Separator',
  component: Separator,
  parameters: {
    docs: {
      description: {
        component:
          'One-pixel rule in the border grey. Horizontal by default (full width); vertical needs a height on its container. Separates ingredients from method, and the sections of the profile.',
      },
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-[320px] p-6 text-sm">
      <p className="pb-3 font-medium">Ingredients</p>
      <Separator />
      <p className="pt-3 text-muted-foreground">400 g plum tomatoes</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-10 items-center gap-3 p-6 text-sm">
      <span>35 min</span>
      <Separator orientation="vertical" />
      <span>Serves 2</span>
      <Separator orientation="vertical" />
      <span>Italian</span>
    </div>
  ),
};
