import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import { signedOutAuth, withAuth } from './fixtures';

const meta = {
  title: 'Auth/Screens',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Email and password only — the Lovable Google wrapper was dropped at the port, so there is no OAuth button and no divider. Both screens are a narrow centred column: the strawberry mark, a title, the fields, one black pill button, and a link across to the other screen. Signup adds an @handle field with the at-sign fixed inside the input.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Login: Story = {
  render: () => <LoginScreen />,
  decorators: [
    withAuth(signedOutAuth),
    Story => (
      <MemoryRouter initialEntries={['/login']}>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const Signup: Story = {
  render: () => <SignupScreen />,
  decorators: [
    Story => (
      <MemoryRouter initialEntries={['/signup']}>
        <Story />
      </MemoryRouter>
    ),
  ],
};
