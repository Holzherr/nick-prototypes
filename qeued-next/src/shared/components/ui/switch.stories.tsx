import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './switch';

const meta = {
  title: 'Shared/UI/Switch',
  component: Switch,
  parameters: { docs: { description: { component: 'Toggle: grey track, blue when on. Used for the public-profile setting.' } } },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-3 p-6 text-sm">
      <Switch defaultChecked id="public" />
      <label htmlFor="public">Public profile</label>
    </div>
  ),
};
