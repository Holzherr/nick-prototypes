import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ARRANGEMENTS } from '@/features/resources/subitising/patterns';
import { AnswerRow } from './AnswerRow';
import { CompareSides } from './CompareSides';
import { DotCard } from './DotCard';
import { ObjectCard } from './ObjectCard';
import { StarRow } from './StarRow';

const meta = {
  title: 'Games/Pieces',
  component: AnswerRow,
  parameters: {
    docs: {
      description: {
        component:
          'The parts every question is built from. AnswerRow: round pink number bubbles; after a tap the right one turns green and bounces, a wrong pick wobbles. DotCard: cream card with a subitising pattern (same arrangements as the printable cards) and an optional pink 🙈 flap. ObjectCard: a wrap of big emoji; tapped ones grow and glow. CompareSides: two cream panels of emoji; the bigger side gets a green ring after a tap. StarRow: one star per question, lit when right.',
      },
    },
  },
  args: { options: [3, 4, 5], answer: 4, chosen: null, onPick: fn() },
} satisfies Meta<typeof AnswerRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Answers: Story = {};
export const RightPick: Story = { args: { chosen: 4 } };
export const WrongPick: Story = { args: { chosen: 5 } };

export const DotCards: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8 p-8">
      {ARRANGEMENTS.map((a) => (
        <div key={a.id} className="flex flex-col items-center gap-3">
          <DotCard count={Math.min(a.max, 7)} arrangement={a.id} seed={3} />
          <b>
            {a.name} · {Math.min(a.max, 7)}
          </b>
        </div>
      ))}
      <DotCard count={4} hidden />
    </div>
  ),
};

export const Objects: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-8 p-8">
      <ObjectCard emoji="🦋" count={7} counted={[0, 3]} onTap={fn()} />
      <ObjectCard emoji="🦄" count={5} popFrom={3} />
    </div>
  ),
};

export const Compare: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-10 p-8">
      <CompareSides left={4} right={6} leftEmoji="🍓" rightEmoji="🍒" answer="right" onPick={fn()} />
      <CompareSides left={4} right={6} leftEmoji="🌸" rightEmoji="🌷" answer="right" chosen="left" />
    </div>
  ),
};

export const Stars: Story = {
  render: () => (
    <div className="p-8">
      <StarRow total={5} results={[true, false, true]} />
    </div>
  ),
};
