import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { gameById } from '@/features/games/catalog';
import { SAMPLE_PROGRESS, TARA } from '../fixtures';
import { emptyProgress } from '../model';
import { CheckInPanel } from './CheckInPanel';
import { DashboardScreen } from './DashboardScreen';
import { SkillRow } from './SkillRow';

const meta = {
  title: 'Screens/Grown-ups',
  component: DashboardScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Grown-ups screen behind the sum gate. One cream card: "🦄 Tara’s progress" with age, this week’s rounds/days/minutes and sticker count; the levelling rule; a SkillRow per game (accuracy bar, − Lv n + stepper, advice, often-missed numbers, print link for the current stage); the weekly check-in; a notice when changes are waiting to upload; Free printables / Switch or add child / Sign out.',
      },
    },
  },
  args: {
    child: TARA,
    progress: SAMPLE_PROGRESS,
    pending: 0,
    onSetLevel: fn(),
    onAddCheckin: fn(),
    onSwitchChild: fn(),
    onSignOut: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof DashboardScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithProgress: Story = {};
export const FirstDay: Story = { args: { progress: emptyProgress() } };
export const WaitingToUpload: Story = { args: { pending: 3 } };

export const Row: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="max-w-[720px] rounded-[36px] bg-cream p-6">
      <SkillRow
        game={gameById('find')}
        level={1}
        stats={{ pct: 60, rounds: 3 }}
        missed={[
          { target: '6', count: 3 },
          { target: '9', count: 2 },
        ]}
        onSetLevel={fn()}
      />
      <SkillRow game={gameById('peek')} level={0} stats={{ pct: 93, rounds: 3 }} missed={[]} onSetLevel={fn()} print={{ href: '#', label: 'Print stage 1 quick peek dot cards' }} />
    </div>
  ),
};

export const CheckInForm: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="max-w-[720px] rounded-[36px] bg-cream p-6">
      <CheckInPanel checkins={SAMPLE_PROGRESS.checkins} onSubmit={fn()} initiallyOpen />
    </div>
  ),
};
