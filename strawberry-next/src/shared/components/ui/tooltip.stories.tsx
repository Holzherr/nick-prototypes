import type { Meta, StoryObj } from '@storybook/react-vite';
import { Share2 } from 'lucide-react';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

const meta = {
  title: 'Shared/UI/Tooltip',
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component:
          'Small dark label that fades in above its trigger after a short hover. Needs a TooltipProvider somewhere above it — the app puts one at the root. Only used to name icon-only buttons.',
      },
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <div className="p-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" aria-label="Share">
              <Share2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy link</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};
