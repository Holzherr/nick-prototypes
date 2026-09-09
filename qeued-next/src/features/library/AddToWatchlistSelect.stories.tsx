import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import AddToWatchlistSelect from './AddToWatchlistSelect';

const meta = {
  title: 'Library/AddToWatchlistSelect',
  component: AddToWatchlistSelect,
  parameters: {
    docs: {
      description: {
        component:
          'The "Add to…" control on every title card: a select with the four statuses; once the title is in the library it collapses to an outline badge ("Watched ✓"). Writes the watch entry itself, so it needs a signed-in user to actually save.',
      },
    },
  },
  args: { titleName: 'Severance', titleId: '11111111-1111-4111-8111-111111111111', onStatusChange: fn() },
} satisfies Meta<typeof AddToWatchlistSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotAdded: Story = {};
export const Small: Story = { args: { size: 'sm' } };
export const AlreadyWatched: Story = { args: { currentStatus: 'watched' } };
