import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

const meta = {
  title: 'Shared/UI/Sheet',
  component: Sheet,
  parameters: {
    docs: {
      description: {
        component:
          'Panel that slides in from an edge over a dimmed overlay — `side` takes right (default), left, top or bottom. The AI assistant uses the right sheet on desktop and the bottom sheet on a phone.',
      },
    },
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FromRight: Story = {
  render: () => (
    <div className="p-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Ask Strawberry</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Ask Strawberry</SheetTitle>
            <SheetDescription>Add to your list, save a recipe, plan a meal.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  ),
};

export const FromBottom: Story = {
  render: () => (
    <div className="p-6">
      <Sheet defaultOpen>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Ask Strawberry</SheetTitle>
            <SheetDescription>Add to your list, save a recipe, plan a meal.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  ),
};
