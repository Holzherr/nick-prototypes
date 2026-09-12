import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AccountPanel } from './AccountPanel';

const meta = {
  title: 'Screens/Account',
  component: AccountPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'On the grown-ups screen: whether this is a signed-in session or a guest one, which account, and whether anything is still waiting to upload. With a single child the app opens straight into her garden, so the profiles screen never appears — without this there was nowhere at all to see who was signed in.',
      },
    },
  },
  args: { pending: 0, onSwitchChild: fn(), onSignOut: fn() },
  decorators: [(Story) => <div className="mx-auto max-w-[700px] rounded-[36px] bg-cream p-6">{Story()}</div>],
} satisfies Meta<typeof AccountPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = { args: { email: 'nick@example.com' } };
export const SignedInWithUploadsPending: Story = { args: { email: 'nick@example.com', pending: 7 } };
export const PlayingAsGuest: Story = {};
