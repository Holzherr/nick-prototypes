import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { recommendations, userId } from '@/features/library/fixtures';
import RecommendationCard from './RecommendationCard';

const meta = {
  title: 'Recommend/RecommendationCard',
  component: RecommendationCard,
  parameters: {
    docs: {
      description: {
        component:
          'One recommendation: poster (or placeholder) left, title + year + type, genre badges, a match-score badge, the one-line "because you liked…" explanation, then an "Add to…" status select and a skip button. Rating state appears after marking watched. Shared variant shows the "both of you" framing.',
      },
    },
  },
  args: { userId, onRemoved: fn(), onNeedMore: fn() },
} satisfies Meta<typeof RecommendationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Personal: Story = { args: { rec: recommendations[0] } };
export const Shared: Story = { args: { rec: recommendations[1], shared: true } };
