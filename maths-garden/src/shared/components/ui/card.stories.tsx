import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import { Card } from './card';
import { Input } from './input';

const meta = {
  title: 'Shared/UI/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          'Card: cream panel, 36px radius, 12px petal slab underneath; used for sign-in, profiles, the grown-ups gate and the progress screen. Input: 48px white field with a 2px petal border that turns pink on focus, 16px text so iOS does not zoom.',
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithForm: Story = {
  render: () => (
    <div className="p-8">
      <Card className="flex max-w-md flex-col gap-4">
        <h2 className="text-3xl font-semibold text-raspberry">Grown-ups</h2>
        <Input placeholder="Email" type="email" />
        <Input placeholder="Password" type="password" />
        <Button>Sign in</Button>
      </Card>
    </div>
  ),
};
