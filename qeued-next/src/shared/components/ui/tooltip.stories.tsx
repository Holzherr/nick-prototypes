import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

const meta = {
  title: 'Shared/UI/Tooltip',
  component: Tooltip,
  parameters: { docs: { description: { component: 'Small dark label that appears on hover or focus. Provider lives in App.' } } },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="p-10">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Skip this recommendation</TooltipContent>
      </Tooltip>
    </div>
  ),
};
