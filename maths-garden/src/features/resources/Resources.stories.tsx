import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResourcesScreen } from './ResourcesScreen';
import { DEFAULT_OPTIONS } from './subitising/cards';
import { ARRANGEMENTS } from './subitising/patterns';
import { SubitisingCard } from './subitising/SubitisingCard';
import { SubitisingCardsScreen } from './subitising/SubitisingCardsScreen';

const meta = {
  title: 'Printables/Resources',
  component: ResourcesScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Public printables (#/resources, no sign-in). Index: logo, "Free printables", the Print → Check → Move up loop, then one cream section per skill with its stage chips and printables (ready ones link per stage, planned ones say Coming soon). Card maker: options card (name, picture, stage, patterns, answers, extras, size, Print) beside live A4 page previews; printing drops everything but the pages.',
      },
    },
  },
} satisfies Meta<typeof ResourcesScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {};

export const CardMaker: Story = { render: () => <SubitisingCardsScreen initial={{ ...DEFAULT_OPTIONS, name: 'Tara', stage: 2 }} /> };

export const CardMakerUnicorns: Story = {
  render: () => <SubitisingCardsScreen initial={{ ...DEFAULT_OPTIONS, name: 'Tara', icon: '🦄', stage: 3, answers: 'corner', guide: false }} />,
};

export const Cards: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid max-w-[900px] grid-cols-2 gap-4 sm:grid-cols-3">
      {ARRANGEMENTS.map((a) => (
        <div key={a.id} className="aspect-[100/72]">
          <SubitisingCard face={{ kind: 'dots', n: Math.min(a.max, 7), arrangement: a.id, seed: 2 }} icon="dot" name="Tara" />
        </div>
      ))}
      <div className="aspect-[100/72]">
        <SubitisingCard face={{ kind: 'dots', n: 5, arrangement: 'dice', seed: 2 }} icon="🦄" name="Tara" answerCorner />
      </div>
      <div className="aspect-[100/72]">
        <SubitisingCard face={{ kind: 'numeral', n: 7 }} icon="dot" name="Tara" />
      </div>
    </div>
  ),
};
