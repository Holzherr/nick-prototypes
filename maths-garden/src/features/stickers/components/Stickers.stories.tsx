import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SAMPLE_PROGRESS } from '@/features/progress/fixtures';
import { PACKS } from '../catalog';
import { PackChooser } from './PackChooser';
import { EmptySlot, StickerBadge } from './StickerBadge';
import { StickerBookScreen } from './StickerBookScreen';
import { StickerReveal } from './StickerReveal';

const meta = {
  title: 'Stickers/StickerBadge',
  component: StickerBadge,
  parameters: {
    docs: {
      description: {
        component:
          'Round die-cut stickers: emoji on the pack gradient (Unicorns pink→lilac, K-pop Hunters pink→purple, Ice Queen white→ice blue), thick white edge, soft shadow, fixed tilt. Sparkly ones (perfect rounds) get a gold ring and ✨; duplicates show ×n. EmptySlot is the dashed "?" for one not collected yet.',
      },
    },
  },
  args: { sticker: PACKS[0].stickers[1], size: 120 },
} satisfies Meta<typeof StickerBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Sparkly: Story = { args: { shiny: true, count: 2 } };

export const AllPacks: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-8">
      {PACKS.map((pack) => (
        <div key={pack.id} className="flex flex-wrap items-center gap-5">
          <b className="w-32">{pack.name}</b>
          {pack.stickers.map((s) => (
            <StickerBadge key={s.id} sticker={s} size={80} />
          ))}
          <EmptySlot size={80} />
        </div>
      ))}
    </div>
  ),
};

export const Chooser: Story = {
  render: () => (
    <div className="p-8">
      <PackChooser onPick={fn()} />
    </div>
  ),
};

export const Reveal: Story = {
  render: () => (
    <div className="p-8">
      <StickerReveal sticker={PACKS[2].stickers[4]} shiny />
    </div>
  ),
};

export const Book: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <StickerBookScreen childName="Tara" stickers={SAMPLE_PROGRESS.stickers} onHome={fn()} />,
};

export const EmptyBook: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <StickerBookScreen childName="Tara" stickers={[]} onHome={fn()} />,
};
