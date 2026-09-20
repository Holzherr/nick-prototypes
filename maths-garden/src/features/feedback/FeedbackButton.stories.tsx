import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeedbackButton } from './FeedbackButton';

const meta = {
  title: 'Screens/Feedback',
  component: FeedbackButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The feedback box that sits in the footer of the grown-up pages (the homepage and the progress screen). Closed it is one quiet button; open it is a message, two rows of chips — who is typing (Nick, Priyanka or Tara, remembered on this device) and what sort of thing it is (bug, idea, Tara noticed) — and an optional email. Nothing here is on a screen a child plays on.',
      },
    },
  },
} satisfies Meta<typeof FeedbackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};
export const Open: Story = { args: { defaultOpen: true } };
