import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppIcon } from './AppIcon';
import { Logo } from './Logo';

const meta = {
  title: 'Brand/Logo',
  component: Logo,
  parameters: {
    docs: {
      description: {
        component: 'The Q tile (pink→purple→blue gradient, white bold Q, rounded) with the "Qeued" wordmark. AppIcon is the tile alone and is also rendered to the PWA icons in public/icons.',
      },
    },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6 p-6">
      <AppIcon size={24} />
      <AppIcon size={32} />
      <AppIcon size={64} />
      <AppIcon size={128} className="rounded-3xl" />
    </div>
  ),
};
