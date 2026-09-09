import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const meta = {
  title: 'Shared/UI/Popover',
  component: Popover,
  parameters: {
    docs: {
      description: {
        component:
          'Small floating panel anchored to its trigger, 288px wide by default, white on a hairline border with a soft shadow. Used for the filter chips on discover and for the meal-type picker on the plan.',
      },
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Cuisine</Button>
        </PopoverTrigger>
        <PopoverContent className="space-y-1">
          {['Italian', 'Japanese', 'Indian', 'Mexican'].map(c => (
            <button key={c} className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent">
              {c}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  ),
};
