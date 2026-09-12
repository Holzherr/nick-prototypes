import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SAMPLE_PROGRESS, TARA } from '../fixtures';
import { emptyProgress } from '../model';
import { ProgressScreen } from './ProgressScreen';
import { ScoringDiagram } from './ScoringDiagram';

const meta = {
  title: 'Screens/Progress over time',
  component: ProgressScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The charts behind the grown-ups screen: totals, accuracy and speed by week, a square per day played, then per skill the level ladder, weekly accuracy and every number asked coloured by how it goes. It ends with the scoring diagram, so "how does it know?" is answered in the same place as "how is she doing?".',
      },
    },
  },
  args: { child: TARA, progress: SAMPLE_PROGRESS, onClose: fn() },
} satisfies Meta<typeof ProgressScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EightWeeksIn: Story = {};
export const DayOne: Story = { args: { progress: emptyProgress() } };

export const TheScoringRules: Story = {
  name: 'Scoring diagram on its own',
  parameters: { layout: 'padded' },
  render: () => (
    <div className="mx-auto max-w-[760px] rounded-[36px] bg-cream p-6">
      <ScoringDiagram />
    </div>
  ),
};
