import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './input';
import { Label } from './label';

const meta = {
  title: 'Shared/UI/Input',
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          '40px-high field, hairline border, rounded 8px. Font size is pinned to 16px in base styles so iOS does not zoom on focus. Used for search, the ingredient and step builders, and every auth field.',
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { placeholder: 'Search recipes, ingredients, cuisines' } };

export const WithLabel: Story = {
  render: () => (
    <div className="w-[320px] space-y-2 p-6">
      <Label htmlFor="title">Recipe title</Label>
      <Input id="title" placeholder="Miso aubergine" />
    </div>
  ),
};

export const Disabled: Story = { args: { placeholder: 'Handle', disabled: true } };
