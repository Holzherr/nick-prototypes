import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const meta = {
  title: 'Shared/UI/Select',
  component: Select,
  parameters: {
    docs: {
      description: {
        component: 'Radix select: bordered trigger with a chevron, popover list of items. Used for "Add to…" status pickers and rating dropdowns.',
      },
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-56 p-6">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Add to…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="want_to_watch">Want to Watch</SelectItem>
          <SelectItem value="watching">Watching</SelectItem>
          <SelectItem value="watched">Watched</SelectItem>
          <SelectItem value="dropped">Dropped</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
