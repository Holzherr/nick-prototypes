import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SAMPLE_PROGRESS } from '@/features/progress/fixtures';
import { emptyProgress, type Progress } from '@/features/progress/model';
import { gardenOf } from '../garden-state';
import { GardenScene } from './GardenScene';
import { GardenScreen } from './GardenScreen';

const busy = (): Progress => ({
  ...SAMPLE_PROGRESS,
  rounds: Array.from({ length: 26 }, (_, i) => ({
    ...SAMPLE_PROGRESS.rounds[i % SAMPLE_PROGRESS.rounds.length],
    id: `busy-${i}`,
    score: [5, 4, 3, 5, 2][i % 5],
    level: i % 4,
    playedAt: new Date(Date.now() - (26 - i) * 3600_000).toISOString(),
  })),
  stickers: Array.from({ length: 52 }, (_, i) => ({ ...SAMPLE_PROGRESS.stickers[i % SAMPLE_PROGRESS.stickers.length], id: `sticker-${i}` })),
});

const meta = {
  title: 'Screens/Garden',
  component: GardenScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The slow reward loop: every finished round plants a flower (species by game, open as wide as the round was good), ten stickers bring a butterfly, the daily goal brings a rainbow and fifty stickers bring a unicorn. The same scene runs as a band along the bottom of the home screen.',
      },
    },
  },
  args: { childName: 'Tara', garden: gardenOf(SAMPLE_PROGRESS), onHome: fn() },
} satisfies Meta<typeof GardenScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstWeeks: Story = {};
export const AfterARound: Story = { args: { news: 'A big new flower bloomed in your garden! 🌻', onPlay: fn() } };
export const FullOfFlowers: Story = { args: { garden: gardenOf(busy()) } };
export const DayOne: Story = { args: { garden: gardenOf(emptyProgress()) } };

export const HomeStrip: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="mx-auto max-w-[760px] overflow-hidden rounded-3xl bg-[#dff3ea]">
      <GardenScene garden={gardenOf(busy())} variant="strip" />
    </div>
  ),
};
