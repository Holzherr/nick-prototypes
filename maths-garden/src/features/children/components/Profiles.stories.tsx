import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AuthForm } from '@/features/auth/AuthForm';
import { TARA } from '@/features/progress/fixtures';
import { ProfilesScreen } from './ProfilesScreen';

const meta = {
  title: 'Screens/Sign-in and profiles',
  component: ProfilesScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Grown-up entry screens. Sign in: logo, one-line explainer, email + password, pink button, sign-in/create toggle, and a link to the free printables. Profiles: "Who’s playing?" with a big avatar button per child and "+ Add a child"; with no children yet it opens on the form (first name, optional birthday, picture). The chosen child opens automatically on this device from then on. A pale account row closes the card: signed in it shows the address and a quiet "Sign out"; as a guest it says "No account" and the pink action is "Sign in to save →", because there is nothing to sign out of.',
      },
    },
  },
  args: { profiles: [TARA], email: 'parent@example.com', onPick: fn(), onCreate: async () => true, onSignOut: fn() },
} satisfies Meta<typeof ProfilesScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WhoIsPlaying: Story = { args: { profiles: [TARA, { id: 'b', name: 'Leo', birthdate: null, avatar: '🐞' }] } };
export const FirstChild: Story = { args: { profiles: [] } };
/** Playing without an account — the screen a signed-out visitor actually lands on. The account row offers
 *  the way in, not a way out of an account she never had. */
export const GuestNoAccount: Story = { args: { profiles: [], guestMode: true, email: 'a guest (saved on this device only)' } };
export const SaveFailed: Story = { args: { profiles: [], error: 'Could not save the profile.' } };

export const SignIn: Story = { render: () => <AuthForm mode="sign-in" onModeChange={fn()} onSubmit={fn()} onGoogle={fn()} onGuest={fn()} /> };
export const CreateAccount: Story = {
  render: () => <AuthForm mode="sign-up" onModeChange={fn()} onSubmit={fn()} onGoogle={fn()} onGuest={fn()} notice="Check your email to confirm the account, then sign in." />,
};
