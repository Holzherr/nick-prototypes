import type { Meta, StoryObj } from '@storybook/react-vite';
import AuthScreen from '@/features/auth/AuthScreen';
import LandingScreen from './LandingScreen';
import NotFound from './NotFound';

const meta = {
  title: 'Screens/Landing',
  component: LandingScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Signed-out screens. Landing: public header, two-line hero ("Track what you watch. Discover what\'s next."), Get started button, then the "Popular right now" grid of title cards loaded from get-popular. Auth: centred card with email + password and a sign-in/sign-up toggle. NotFound: 404 with a link home.',
      },
    },
  },
} satisfies Meta<typeof LandingScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Landing: Story = {};
export const Auth: Story = { render: () => <AuthScreen /> };
export const NotFoundScreen: Story = { render: () => <NotFound /> };
