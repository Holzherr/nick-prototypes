import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './input';
import { Label } from './label';

const meta = {
  title: 'Shared/UI/Label',
  component: Label,
  parameters: {
    docs: {
      description: {
        component:
          '14px medium-weight caption sitting above a field, or beside a checkbox. Dims with the control when it is disabled.',
      },
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Cook time' } };

export const OverField: Story = {
  render: () => (
    <div className="w-[280px] space-y-2 p-6">
      <Label htmlFor="cook">Cook time</Label>
      <Input id="cook" placeholder="35 min" />
    </div>
  ),
};
