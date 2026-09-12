import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgressControl } from "./ProgressControl";

const meta = {
  title: "Queue/ProgressControl",
  component: ProgressControl,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Where you are in a series. Episodes are stored as the last one watched, so the label reads one ahead — the question on a weeknight is which episode is next, not how many you've done.",
      },
    },
  },
  args: { onChange: () => {} },
} satisfies Meta<typeof ProgressControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PartWayThrough: Story = {
  args: { progress: { current_season: 1, current_episode: 5, seasons: 2, episodes: 19 } },
};

export const NotStarted: Story = {
  args: { progress: { current_season: null, current_episode: null, seasons: 3, episodes: 24 } },
};

export const NoTotalsKnown: Story = {
  args: { progress: { current_season: 2, current_episode: 3 } },
};

export const Compact: Story = {
  args: { progress: { current_season: 1, current_episode: 2, seasons: 1, episodes: 8 }, compact: true },
};
