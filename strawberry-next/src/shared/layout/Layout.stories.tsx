import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { signedInAuth, signedOutAuth, withAuth } from '@/features/auth/fixtures';
import Layout from './Layout';

// Layout reads useAuth(), so stories hand it a fixed auth state rather than a live session.
const meta = {
  title: 'Shared/Layout/Layout',
  component: Layout,
  parameters: {
    docs: {
      description: {
        component:
          'The app shell. On desktop: logo left, five section links centred, avatar or a Log in pill right, all above a hairline. On a phone: a slim top bar with the mark and avatar, and a fixed bottom tab bar of five icon+label tabs — Find, Box, Plan, List, Profile — with the active tab in full ink and a heavier stroke. Content sits between them and gets 80px of bottom padding on mobile so the tab bar never covers it.',
      },
    },
    layout: 'fullscreen',
  },
  decorators: [
    withAuth(signedInAuth),
    Story => (
      <MemoryRouter initialEntries={['/recipes']}>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

const Page = () => (
  <div className="mx-auto max-w-3xl space-y-4 p-6">
    <h1 className="text-2xl font-semibold tracking-tight">Find</h1>
    <p className="text-sm text-muted-foreground">
      Search by ingredient, dish or cuisine. Filter by diet and cook time.
    </p>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="space-y-2">
          <div className="aspect-[4/3] rounded-lg bg-muted" />
          <div className="h-3 w-3/4 rounded bg-muted" />
        </div>
      ))}
    </div>
  </div>
);

export const Desktop: Story = {
  args: { children: <Page /> },
  parameters: { viewport: { defaultViewport: 'desktop' } },
};

export const Mobile: Story = {
  args: { children: <Page /> },
  parameters: { viewport: { defaultViewport: 'iphone' } },
};

export const SignedOut: Story = {
  args: { children: <Page /> },
  decorators: [withAuth(signedOutAuth)],
};
