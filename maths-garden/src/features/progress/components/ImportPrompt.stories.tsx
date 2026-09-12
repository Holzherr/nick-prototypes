import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SAMPLE_PROGRESS, TARA } from '../fixtures';
import type { GuestProfile } from '../guest';
import { ImportPromptScreen } from './ImportPromptScreen';

const guest: GuestProfile = {
  child: { id: 'guest-1', name: 'Tara', birthdate: null, avatar: '🦄' },
  progress: SAMPLE_PROGRESS,
  rounds: 27,
  stickers: 9,
  days: 6,
  lastPlayed: new Date(Date.now() - 36e5).toISOString(),
};

const meta = {
  title: 'Screens/Guest import',
  component: ImportPromptScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Shown before the garden the first time a signed-in parent opens a child while guest play is still on the device. Guest progress belongs to a different child id, so after signing in it disappears from view and looks exactly like lost data — this offers to bring it across, and "Not now" leaves it on the grown-ups screen.',
      },
    },
  },
  args: { childName: TARA.name, childAvatar: TARA.avatar, profiles: [guest], onImport: fn(), onSkip: fn(), onDone: fn() },
} satisfies Meta<typeof ImportPromptScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Offer: Story = {};
export const Adding: Story = { args: { busy: true } };
export const Added: Story = { args: { imported: { name: 'Tara', rounds: 27, stickers: 9 } } };
export const TwoProfiles: Story = {
  args: { profiles: [guest, { ...guest, child: { ...guest.child, id: 'guest-2', name: 'Sam', avatar: '🐰' }, rounds: 4, stickers: 1, days: 2 }] },
};
