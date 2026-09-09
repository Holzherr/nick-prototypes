import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppIcon } from './AppIcon';
import { Logo } from './Logo';
import { StrawberryMark } from './strawberry-mark';

const meta = {
  title: 'Brand/Strawberry',
  parameters: {
    docs: {
      description: {
        component:
          'The whole brand. `StrawberryMark` is the berry — a red body under a black calyx with three white seeds, flat, no gradients. `Logo` sets it at cap height beside the wordmark in ink (`markOnly` drops the word, which is what the phone header uses). `AppIcon` centres the berry on white inside a hairline squircle, and the PNGs in public/icons are rendered from it. This red is the only colour in the product — every other surface, border and label is greyscale.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Mark: Story = {
  render: () => (
    <div className="flex items-end gap-6 p-8">
      <StrawberryMark className="size-4" />
      <StrawberryMark className="size-6" />
      <StrawberryMark className="size-10" />
      <StrawberryMark className="size-16" />
      <StrawberryMark className="size-24" />
    </div>
  ),
};

export const Lockup: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6 p-8">
      <Logo size="sm" />
      <Logo size="md" />
      <Logo size="lg" />
      <Logo size="md" markOnly />
    </div>
  ),
};

export const Icon: Story = {
  render: () => (
    <div className="flex items-end gap-6 p-8">
      <AppIcon className="w-12" />
      <AppIcon className="w-16" />
      <AppIcon className="w-24" />
    </div>
  ),
};
