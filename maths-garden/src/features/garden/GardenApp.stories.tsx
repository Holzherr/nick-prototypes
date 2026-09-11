import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SAMPLE_PROGRESS, TARA } from '@/features/progress/fixtures';
import { memoryRemote } from '@/features/progress/memory-remote';
import { createRepo } from '@/features/progress/repo';
import { MemoryStorage } from '@/shared/utils/storage';
import { GardenApp } from './GardenApp';

const repo = (seed?: typeof SAMPLE_PROGRESS) => createRepo(memoryRemote(seed ? { [TARA.id]: seed } : {}), new MemoryStorage());

const meta = {
  title: 'Screens/Garden (playable)',
  component: GardenApp,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The whole child app against an in-memory server: play a game, pick a sticker, open the sticker book, pass the gate to the grown-ups screen. Same component the live app renders once a child is chosen.',
      },
    },
  },
  argTypes: { repo: { control: false }, child: { control: false } },
  args: { child: TARA, repo: repo(), onSwitchChild: fn(), onSignOut: fn() },
} satisfies Meta<typeof GardenApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstVisit: Story = {};
export const WithProgress: Story = { args: { repo: repo(SAMPLE_PROGRESS) } };
