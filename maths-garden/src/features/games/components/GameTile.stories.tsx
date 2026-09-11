import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { GAMES } from '../catalog';
import { GameTile } from './GameTile';

const meta = {
  title: 'Games/GameTile',
  component: GameTile,
  parameters: {
    docs: {
      description: {
        component:
          'Home-screen tile: a cream blob (five slightly different wobbly outlines) with a petal slab, big emoji, game name, and one dot per level (pink up to the current level).',
      },
    },
  },
  args: { game: GAMES[0], level: 1, shape: 0, onClick: fn() },
} satisfies Meta<typeof GameTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllGames: Story = {
  render: () => (
    <div className="flex max-w-[860px] flex-wrap justify-center gap-6 p-8">
      {GAMES.map((game, i) => (
        <GameTile key={game.id} game={game} level={i % 3} shape={i} />
      ))}
    </div>
  ),
};
