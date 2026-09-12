import type { Meta, StoryObj } from '@storybook/react-vite';
import { ARTICLES } from '../articles';
import { ArticleScreen } from './ArticleScreen';
import { HomeScreen } from './HomeScreen';
import { MarketingLayout } from './MarketingLayout';

const meta = {
  title: 'Screens/Homepage',
  component: HomeScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The signed-out front door at #/home: what it is, why it is different, the print → check → move up → print next loop, every free printable grouped by skill, the five games, the two research guides and the FAQ. The header carries the free-printables menu; signing in lives at #/login.',
      },
    },
  },
} satisfies Meta<typeof HomeScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Homepage: Story = { render: () => <MarketingLayout><HomeScreen /></MarketingLayout> };

export const StagesGuide: Story = {
  name: 'Guide: stages of maths and reading',
  render: () => (
    <MarketingLayout>
      <ArticleScreen article={ARTICLES[0]} />
    </MarketingLayout>
  ),
};

export const GamifiedGuide: Story = {
  name: 'Guide: does gamified learning work',
  render: () => (
    <MarketingLayout>
      <ArticleScreen article={ARTICLES[1]} />
    </MarketingLayout>
  ),
};
