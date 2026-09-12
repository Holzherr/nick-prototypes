import type { Meta, StoryObj } from "@storybook/react-vite";
import { PickCard, type TonightPick } from "./TonightScreen";

const meta = {
  title: "Tonight/PickCard",
  component: PickCard,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "One suggestion for tonight. Carries where you can actually watch it — the piece the app was missing — and marks whether it came off your own list or from outside it.",
      },
    },
  },
} satisfies Meta<typeof PickCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const base: TonightPick = {
  title: "Sharp Objects",
  type: "series",
  year: 2018,
  genres: ["Crime", "Drama", "Mystery"],
  imdb_rating: 8,
  explanation: "Slow-burn and dark, and you're already part-way in — one episode is an easy start.",
  pick_type: "best",
  in_queue: true,
  runtime_minutes: 55,
  providers: [
    { provider: "HBO Max", offer_type: "subscription" },
    { provider: "Amazon Video", offer_type: "buy" },
  ],
};

export const Best: Story = { args: { pick: base, emphasis: true } };

export const Alternative: Story = {
  args: {
    pick: { ...base, title: "The Bureau", year: 2015, pick_type: "safe", providers: [{ provider: "Paramount+", offer_type: "subscription" }] },
  },
};

export const Wildcard: Story = {
  args: {
    pick: {
      ...base,
      title: "The Killing",
      year: 2011,
      pick_type: "wildcard",
      in_queue: false,
      providers: [],
      explanation: "Rain-soaked and relentless — worth abandoning the list for.",
    },
  },
};
