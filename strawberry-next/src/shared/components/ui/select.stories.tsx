import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './select';

const meta = {
  title: 'Shared/UI/Select',
  component: Select,
  parameters: {
    docs: {
      description: {
        component:
          '40px trigger with a chevron, matching Input; the list drops below with a tick against the current value. Used for servings, cuisine, meal type, and the metric/imperial preference.',
      },
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[240px] p-6">
      <Select defaultValue="dinner">
        <SelectTrigger>
          <SelectValue placeholder="Meal" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Meal</SelectLabel>
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="dinner">Dinner</SelectItem>
            <SelectItem value="snack">Snack</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};
