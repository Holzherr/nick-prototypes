import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { QuestionView } from './QuestionView';

const meta = {
  title: 'Games/QuestionView',
  component: QuestionView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One question of any game, with its spoken prompt and timing. Quick Peek shows the dots for 2 seconds then covers them and shows the answers; Count With Me makes each object tappable; Find the Number speaks a number and has "Hear it again"; Which Has More? is two tappable panels; One More Unicorn adds unicorns one by one before the answers appear.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-[760px] items-center justify-center p-6">
        <Story />
      </div>
    ),
  ],
  args: { question: { game: 'peek', answer: 7, options: [6, 7, 8], arrangement: 'split', seed: 1 }, chosen: null, onAnswer: fn() },
} satisfies Meta<typeof QuestionView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const QuickPeek: Story = {};
export const CountWithMe: Story = { args: { question: { game: 'count', answer: 6, options: [5, 6, 7], emoji: '🦋' } } };
export const FindTheNumber: Story = { args: { question: { game: 'find', answer: 6, options: [9, 6, 4, 8, 5, 7] } } };
export const WhichHasMore: Story = {
  args: { question: { game: 'more', answer: 'left', left: 5, right: 3, leftEmoji: '🧁', rightEmoji: '🍬' } },
};
export const OneMoreUnicorn: Story = { args: { question: { game: 'add', answer: 5, options: [4, 5, 6], base: 3, extra: 2 }, stepMs: 500 } };
export const Answered: Story = { args: { question: { game: 'find', answer: 6, options: [9, 6, 4, 8, 5, 7] }, chosen: 9 } };
