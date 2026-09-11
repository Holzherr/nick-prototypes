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
          'Grown-up entry screens. Sign in: logo, one-line explainer, email + password, pink button, sign-in/create toggle, and a link to the free printables. Profiles: "Who’s playing?" with a big avatar button per child and "+ Add a child"; with no children yet it opens on the form (first name, optional birthday, picture). The chosen child opens automatically on this device from then on.',
      },
    },
  },
  args: { profiles: [TARA], email: 'parent@example.com', onPick: fn(), onCreate: async () => true, onSignOut: fn() },
} satisfies Meta<typeof ProfilesScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WhoIsPlaying: Story = { args: { profiles: [TARA, { id: 'b', name: 'Leo', birthdate: null, avatar: '🐞' }] } };
export const FirstChild: Story = { args: { profiles: [] } };
export const SaveFailed: Story = { args: { profiles: [], error: 'Could not save the profile.' } };

export const SignIn: Story = { render: () => <AuthForm mode="sign-in" onModeChange={fn()} onSubmit={fn()} /> };
export const CreateAccount: Story = { render: () => <AuthForm mode="sign-up" onModeChange={fn()} onSubmit={fn()} notice="Check your email to confirm the account, then sign in." /> };
