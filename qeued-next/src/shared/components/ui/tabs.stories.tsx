import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const meta = {
  title: 'Shared/UI/Tabs',
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component: 'Segmented control on a grey track; the active segment is a white pill. Used for the library status tabs and Recommended / Following on home.',
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="watched" className="w-96 p-6">
      <TabsList>
        <TabsTrigger value="watched">Watched (12)</TabsTrigger>
        <TabsTrigger value="watching">Watching (2)</TabsTrigger>
        <TabsTrigger value="want_to_watch">Want to Watch (9)</TabsTrigger>
      </TabsList>
      <TabsContent value="watched" className="text-sm text-muted-foreground">Your watched titles.</TabsContent>
      <TabsContent value="watching" className="text-sm text-muted-foreground">Currently watching.</TabsContent>
      <TabsContent value="want_to_watch" className="text-sm text-muted-foreground">Ranked by how much you want them.</TabsContent>
    </Tabs>
  ),
};
