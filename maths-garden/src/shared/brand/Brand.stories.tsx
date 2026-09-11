import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppIcon } from './AppIcon';
import { Logo } from './Logo';
import { UnicornMark } from './UnicornMark';

const meta = {
  title: 'Brand/Logo',
  component: Logo,
  parameters: {
    docs: {
      description: {
        component:
          'The unicorn: a cream head facing left with a gold striped horn and a pink/lilac/gold bubble mane, on a pink gradient tile (AppIcon). Logo = tile + "Maths Garden" in raspberry. public/favicon.svg and public/icons are the same drawing.',
      },
    },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6 p-8">
      <AppIcon size={32} />
      <AppIcon size={64} />
      <AppIcon size={128} />
      <AppIcon size={256} />
      <span className="rounded-3xl bg-raspberry p-3">
        <UnicornMark size={128} />
      </span>
    </div>
  ),
};

const SWATCHES = [
  ['blush', '#ffe9f1', 'page'],
  ['petal', '#ffd3e4', 'slabs, borders'],
  ['bubble', '#ff7bac', 'buttons'],
  ['raspberry', '#e0326e', 'titles, slabs'],
  ['cream', '#fffdf9', 'cards'],
  ['grape', '#6b2d5c', 'text'],
  ['sunny', '#ffc94d', 'level up, horn'],
  ['leaf', '#5fbf8a', 'right answer'],
] as const;

export const Palette: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-8 sm:grid-cols-4">
      {SWATCHES.map(([name, hex, use]) => (
        <div key={name} className="flex flex-col gap-1">
          <span className="h-16 rounded-2xl border border-petal" style={{ background: hex }} />
          <b>{name}</b>
          <span className="text-sm text-grape/70">
            {hex} · {use}
          </span>
        </div>
      ))}
    </div>
  ),
};
