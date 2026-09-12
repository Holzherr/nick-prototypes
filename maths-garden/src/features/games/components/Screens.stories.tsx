import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { PACKS } from '@/features/stickers/catalog';
import { gameById, GAMES } from '../catalog';
import { recommendGame } from '../recommend';
import { EndScreen } from './EndScreen';
import { GameScreen } from './GameScreen';
import { GardenHome } from './GardenHome';
import { GrownUpsGate } from './GrownUpsGate';

const meta = {
  title: 'Screens/Game',
  component: GardenHome,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The child-facing screens. Home: unicorn tile, "Tara’s Maths Garden", one big suggested game with the reason under it ("Not played yet today", "One good round to level up!") and the rest behind "Or pick another game"; sticker count top right, faint Grown-ups bottom right. Game: home button, star row, one question at a time. End: stars, score line, optional "New level unlocked!", then the sticker pack chooser; after picking, the sticker pops in with Play again / My stickers / All games. Gate: "Grown-ups only — What is 7 + 5?".',
      },
    },
  },
  args: { childName: 'Tara', levels: { peek: 1, find: 2 }, stickerCount: 6, onPlay: fn(), onStickers: fn(), onGrownUps: fn() },
} satisfies Meta<typeof GardenHome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = { args: { recommended: recommendGame([], { peek: 1, find: 2 }, GAMES) } };
export const HomeEveryGame: Story = { name: 'Home (all games open)', args: { recommended: undefined } };

export const HomeWindDown: Story = {
  name: 'Home (played a lot today)',
  args: { recommended: recommendGame([], { peek: 1, find: 2 }, GAMES), windDown: 'lots', onGarden: fn() },
};

export const Game: Story = {
  render: () => (
    <GameScreen
      game={gameById('count')}
      level={0}
      childName="Tara"
      questions={[
        { game: 'count', answer: 4, options: [3, 4, 5], emoji: '🐞' },
        { game: 'count', answer: 2, options: [1, 2, 3], emoji: '🌷' },
      ]}
      onFinish={fn()}
      onHome={fn()}
    />
  ),
};

const endArgs = { childName: 'Tara', score: 4, total: 5, levelUp: false, onPickPack: fn(), onAgain: fn(), onStickers: fn(), onHome: fn() };

export const EndChooseSticker: Story = { render: () => <EndScreen {...endArgs} sticker={null} /> };
export const EndStickerWon: Story = { render: () => <EndScreen {...endArgs} sticker={{ sticker: PACKS[1].stickers[0], shiny: false }} /> };
export const EndPerfectLevelUp: Story = {
  render: () => <EndScreen {...endArgs} score={5} levelUp sticker={{ sticker: PACKS[0].stickers[1], shiny: true }} />,
};

export const Gate: Story = { render: () => <GrownUpsGate onPass={fn()} onCancel={fn()} rng={() => 0.4} /> };
