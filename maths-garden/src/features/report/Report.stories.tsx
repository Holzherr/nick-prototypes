import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SAMPLE_PROGRESS } from '@/features/progress/fixtures';
import { emptyProgress } from '@/features/progress/model';
import { buildReport } from './report';
import { ReportScreen } from './ReportScreen';

const meta = {
  title: 'Screens/Tutor report',
  component: ReportScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'What the round log says about a child, in a parent’s language: a headline, the week, a row per skill with a verdict and a note, the sheets to print next, off-screen practice and any warning signs. The same content goes out by email when a game moves up a printable stage.',
      },
    },
  },
  args: { report: buildReport('Tara', SAMPLE_PROGRESS), onClose: fn() },
} satisfies Meta<typeof ReportScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AfterAFewWeeks: Story = {};
export const WithEmail: Story = { args: { email: { address: 'nick@example.com', busy: false, sent: false, error: null, onSend: fn() } } };
export const Sent: Story = { args: { email: { address: 'nick@example.com', busy: false, sent: true, error: null, onSend: fn() } } };
export const DayOne: Story = { args: { report: buildReport('Tara', emptyProgress()) } };
