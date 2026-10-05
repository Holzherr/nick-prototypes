import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { gameById } from '../catalog';
import { QUEST, type Quest } from '../quest';
import type { Recommendation } from '../recommend';
import { GameScreen } from './GameScreen';
import { GardenHome } from './GardenHome';
import { QuestionView } from './QuestionView';

/** A quest fixed for the story: Count With Me at level 1 and Make Ten at level 2, taking turns. */
const quest: Quest = {
  games: [gameById('count'), gameById('bond')],
  levels: { count: 1, bond: 2 },
  questions: [
    { game: 'count', answer: 6, options: [5, 6, 7], emoji: '🦋' },
    { game: 'bond', answer: 4, options: [3, 4, 6], whole: 10, shown: 6, frame: false },
    { game: 'count', answer: 3, options: [2, 3, 4], emoji: '🌷' },
    { game: 'bond', answer: 7, options: [6, 7, 8], whole: 10, shown: 3, frame: false },
    { game: 'count', answer: 8, options: [7, 8, 9], emoji: '🍓' },
  ],
};

const meta = {
  title: 'Games/Quest',
  component: GameScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The quest round (specs/rounds.md): five questions from the child’s weakest skills, each drawn by its own game and shown in that game’s style, in one round with one star row. Round: the round itself, Count With Me and Make Ten taking turns. Questions: the first question of each of the two games side by side. Home: the tile home leads with, 🗺️ Quest with the games in it under the reason, in place of one suggested game.',
      },
    },
  },
  args: { game: quest.games[0], level: 1, childName: 'Tara', quest, onFinish: fn(), onHome: fn() },
} satisfies Meta<typeof GameScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Round: Story = {};

export const Questions: Story = {
  render: () => (
    <div className="flex flex-wrap items-start justify-center gap-6 p-6">
      {quest.questions.slice(0, 2).map((question, i) => (
        <QuestionView key={i} question={question} chosen={null} onAnswer={fn()} />
      ))}
    </div>
  ),
};

const recommended: Recommendation = { game: quest.games[0], reason: QUEST.reason, why: 'quest', quest: { ...quest, games: [gameById('bond'), gameById('more'), gameById('fewer')] } };

export const Home: Story = {
  render: () => (
    <GardenHome childName="Tara" levels={{ bond: 2, more: 1, fewer: 3 }} stickerCount={12} today={{ done: 1, goal: 3 }} recommended={recommended} onPlay={fn()} onPlayQuest={fn()} onStickers={fn()} onGrownUps={fn()} />
  ),
};
