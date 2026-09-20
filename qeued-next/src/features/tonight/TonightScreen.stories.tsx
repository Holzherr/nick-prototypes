import type { Meta, StoryObj } from "@storybook/react-vite";
import type { TonightEntry } from "./fastTonight";
import TonightScreen, { PickCard, type TonightPick } from "./TonightScreen";

const meta = {
  title: "Screens/Tonight",
  component: TonightScreen,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Tonight, first frame: ranked on the device from the profile's list before any model call. Title and one-line subtitle; a row of four mood chips, then two length chips (Short night / Got time) with the selected one filled; a blue \"Sharpen these\" button, full-width on phones. Below: two PickCards — poster or icon left, badge (\"Put this on\" tinted, \"Or this\" plain), title with year, a one-line data explanation such as \"On Netflix · 95 min · from your list\", then runtime and provider badges — and a collapsed \"The rest of your list, ranked for tonight (n)\" details block. When a scored slate lands, a \"Sharper picks ready\" banner sits between the buttons and the cards until pressed; the button then reads \"Try again\".",
      },
    },
  },
} satisfies Meta<typeof TonightScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Invented list for the story; the same shape the profile's rows arrive in. */
const row = (name: string, title: Partial<NonNullable<TonightEntry["title"]>>, over: Partial<TonightEntry> = {}): TonightEntry => ({
  status: "want_to_watch", watched_rating: null, current_season: null, current_episode: null, ...over,
  title: { id: name, name, year: 2021, type: "movie", genres: [], tones: [], themes: [], imdb_rating: 7.4, runtime_minutes: 98, seasons: null, image_url: null, title_availability: [{ provider: "Netflix", offer_type: "subscription", url: null }], ...title },
});
const list: TonightEntry[] = [
  row("Harbour Lights", { genres: ["Thriller", "Crime"], tones: ["tense"], runtime_minutes: 95 }),
  row("Long Winter", { type: "series", genres: ["Drama", "Crime"], seasons: 6, runtime_minutes: 55, imdb_rating: 8.9 }),
  row("Small Hours", { genres: ["Comedy"], tones: ["warm"], runtime_minutes: 88, title_availability: [] }),
  row("The Ledger", { type: "series", genres: ["Drama"], seasons: 2, runtime_minutes: 50 }, { status: "watching", current_season: 1, current_episode: 3 }),
];

/** The fast slate with "Sharpen these" waiting to ask the model. Mood and length chips re-rank live. */
export const FastSlate: Story = { args: { preview: list } };

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

export const Best: Story = { render: () => <PickCard pick={base} emphasis /> };

export const Alternative: Story = {
  render: () => <PickCard pick={{ ...base, title: "The Bureau", year: 2015, pick_type: "safe", providers: [{ provider: "Paramount+", offer_type: "subscription" }] }} />,
};

export const Wildcard: Story = {
  render: () => (
    <PickCard pick={{ ...base, title: "The Killing", year: 2011, pick_type: "wildcard", in_queue: false, providers: [], explanation: "Rain-soaked and relentless — worth abandoning the list for." }} />
  ),
};
