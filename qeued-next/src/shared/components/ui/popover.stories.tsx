import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const meta = {
  title: 'Shared/UI/Popover',
  component: Popover,
  parameters: { docs: { description: { component: 'Anchored floating panel. Home uses it for the recommendation filter (mood, type, length).' } } },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Filter</Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 text-sm">
          <p className="font-medium">Mood</p>
          <p className="text-muted-foreground">easy · intense · funny · smart</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
