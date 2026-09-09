import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Input } from './input';
import { Label } from './label';

const meta = {
  title: 'Shared/UI/Dialog',
  component: Dialog,
  parameters: {
    docs: {
      description: {
        component:
          'Centred modal on a dimmed overlay, max 512px wide, rounded, with a close cross top-right. Header holds a title and one line of description; footer right-aligns the actions. Used for importing a recipe by URL and for naming a collection.',
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">New collection</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New collection</DialogTitle>
          <DialogDescription>Group saved recipes so you can share them as one link.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="collection">Name</Label>
          <Input id="collection" placeholder="Weeknight dinners" />
        </div>
        <DialogFooter>
          <Button variant="ghost">Cancel</Button>
          <Button>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Open: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import a recipe</DialogTitle>
          <DialogDescription>Paste a link and we will pull out the ingredients and steps.</DialogDescription>
        </DialogHeader>
        <Input placeholder="https://…" />
        <DialogFooter>
          <Button>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
