import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound';

const meta = {
  title: 'Landing/NotFound',
  component: NotFound,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Centred 404 with a link back to the feed. Nothing else on the page.',
      },
    },
  },
  decorators: [
    Story => (
      <MemoryRouter initialEntries={['/nope']}>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof NotFound>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
