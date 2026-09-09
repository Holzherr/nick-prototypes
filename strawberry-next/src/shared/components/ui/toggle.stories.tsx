import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toggle } from './toggle';

const meta = {
  title: 'Shared/UI/Toggle',
  component: Toggle,
  parameters: {
    docs: {
      description: {
        component:
          'Two-state button: transparent when off, light grey fill when on. Variants default (no border) and outline (hairline border); sizes sm 36px, default 40px, lg 44px. Carries the diet and cuisine filter chips on discover.',
      },
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Vegetarian' } };

export const FilterChips: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 p-6">
      <Toggle variant="outline" defaultPressed>
        Vegetarian
      </Toggle>
      <Toggle variant="outline">Vegan</Toggle>
      <Toggle variant="outline">Gluten-free</Toggle>
      <Toggle variant="outline">Under 30 min</Toggle>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2 p-6">
      <Toggle size="sm" variant="outline">
        Small
      </Toggle>
      <Toggle size="default" variant="outline">
        Default
      </Toggle>
      <Toggle size="lg" variant="outline">
        Large
      </Toggle>
    </div>
  ),
};
