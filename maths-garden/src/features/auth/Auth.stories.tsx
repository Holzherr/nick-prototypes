import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SAMPLE_PROGRESS } from '@/features/progress/fixtures';
import type { GuestProfile } from '@/features/progress/guest';
import { AuthForm } from './AuthForm';

const guest: GuestProfile = {
  child: { id: 'guest-1', name: 'Tara', birthdate: null, avatar: '🦄' },
  progress: SAMPLE_PROGRESS,
  rounds: 27,
  stickers: 9,
  days: 6,
  lastPlayed: new Date(Date.now() - 36e5).toISOString(),
};

const meta = {
  title: 'Screens/Sign in',
  component: AuthForm,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The sign-in card: Continue with Google, then email and password with a 👁 reveal and a warning if autofill leaves a space on the end. When this device has guest play on it the card names it and promises signing in will not touch it — signing in opens an account child with no history, which otherwise looks exactly like the play has been deleted.',
      },
    },
  },
  args: { mode: 'sign-in', onModeChange: fn(), onSubmit: fn(), onGoogle: fn(), onGuest: fn() },
} satisfies Meta<typeof AuthForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {};
export const WithGuestPlayOnTheDevice: Story = { args: { guestProfiles: [guest] } };
export const CreateAccount: Story = { args: { mode: 'sign-up' } };
export const WrongPassword: Story = { args: { error: 'Invalid login credentials' } };
