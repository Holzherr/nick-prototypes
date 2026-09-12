import type { Meta, StoryObj } from '@storybook/react-vite';
import { Section } from './Section';

const meta = {
  title: 'Screens/Section',
  component: Section,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One tap-to-open card on the grown-ups screen: emoji, title, and a one-line summary that is readable while the card is shut, with a chevron that turns a quarter when it opens. The grown-ups screen used to render every panel expanded in a single column — account, actions, motivation, eight skill rows, the weekly check-in and the voice picker — so it ran for several phone-heights and whatever you came for was rarely on screen. The summary line is what makes closing them safe: the state is still legible without opening anything.',
      },
    },
  },
  decorators: [(Story) => <div className="mx-auto max-w-[700px] rounded-[36px] bg-cream p-6">{Story()}</div>],
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Shut: Story = {
  args: {
    icon: '📊',
    title: 'Skills and levels',
    summary: '6 of 8 games played · levels 1–3',
    children: <p className="text-sm text-grape/70">A SkillRow per game lives here.</p>,
  },
};

export const Open: Story = { args: { ...Shut.args, defaultOpen: true } };

export const LongSummaryOnANarrowScreen: Story = {
  args: {
    icon: '📝',
    title: 'Weekly check-in',
    summary: 'Five minutes with real objects, away from the iPad',
    children: <p className="text-sm text-grape/70">The probe list and the logging form live here.</p>,
  },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
