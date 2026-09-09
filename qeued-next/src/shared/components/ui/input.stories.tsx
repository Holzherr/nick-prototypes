import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './input';
import { Textarea } from './textarea';

const meta = {
  title: 'Shared/UI/Input',
  component: Input,
  parameters: {
    docs: {
      description: {
        component: 'Text field and textarea, 40px high, bordered, blue focus ring. Font size stays 16px so iOS does not zoom.',
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { placeholder: 'Search movies and series…' } };

export const WithTextarea: Story = {
  render: () => (
    <div className="w-80 space-y-3 p-6">
      <Input placeholder="Your name" />
      <Input type="email" placeholder="Email" />
      <Textarea placeholder="Tell people what you like to watch" />
    </div>
  ),
};
