import type { Meta, StoryObj } from '@storybook/react-vite';
import Layout from './Layout';
import PublicHeader from './PublicHeader';

const meta = {
  title: 'Shared/Layout/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Signed-in frame: sticky translucent header with logo left and Home / Search / Profile / sign-out right (desktop), a 5xl-wide main column, and a fixed bottom tab bar on mobile. PublicHeader is the signed-out variant with Explore and Sign in links.',
      },
    },
  },
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {
  args: { children: <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">page content</div> },
};

export const Public: Story = {
  args: { children: null },
  render: () => (
    <div className="min-h-screen">
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted-foreground">public page content</main>
    </div>
  ),
};
