import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './checkbox';
import { Label } from './label';

const meta = {
  title: 'Shared/UI/Checkbox',
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component:
          '16px square with a hairline border; checked fills near-black with a white tick. Used down the shopping list, one per item, paired with a Label that carries the tap target.',
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { 'aria-label': 'Check off item' } };

export const Checked: Story = { args: { defaultChecked: true, 'aria-label': 'Check off item' } };

export const ShoppingRows: Story = {
  render: () => (
    <div className="w-[320px] space-y-3 p-6">
      {[
        { id: 'a', label: '2 cloves garlic', done: true },
        { id: 'b', label: '400 g plum tomatoes', done: false },
        { id: 'c', label: 'Basil, a handful', done: false },
      ].map(item => (
        <div key={item.id} className="flex items-center gap-3">
          <Checkbox id={item.id} defaultChecked={item.done} />
          <Label
            htmlFor={item.id}
            className={item.done ? 'text-muted-foreground line-through' : undefined}
          >
            {item.label}
          </Label>
        </div>
      ))}
    </div>
  ),
};
