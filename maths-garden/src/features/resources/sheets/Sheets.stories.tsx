import type { Meta, StoryObj } from '@storybook/react-vite';
import { packFromParams } from '../pack';
import { PackScreen } from '../PackScreen';
import { SHEETS, type SheetId, type SheetOptions } from './catalog';
import { SheetScreen } from './SheetScreen';

const options = (id: SheetId, stage: 1 | 2 | 3 = 1): SheetOptions => ({ id, name: 'Tara', icon: '🦄', stage });

const meta = {
  title: 'Printables/Sheets',
  component: SheetScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The sheet maker behind #/resources/sheet: pick a sheet, a name, a picture and a stage; the A4 pages preview live and print edge to edge. Every sheet starts with a how-to page and carries a QR code that opens the game checking the same skill.',
      },
    },
  },
  args: { initial: options('counting-mats') },
} satisfies Meta<typeof SheetScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CountingMats: Story = {};
export const NumeralCardsAndHunt: Story = { args: { initial: options('numeral-cards', 2) } };
export const MoreOrFewer: Story = { args: { initial: options('more-or-fewer', 2) } };
export const UnicornStories: Story = { args: { initial: options('unicorn-stories') } };
export const NumberTrack: Story = { args: { initial: options('number-track', 3) } };

export const StagePack: Story = {
  name: 'Stage pack (every sheet at once)',
  parameters: { docs: { description: { story: 'What “Print this stage’s pack” on the grown-ups screen opens: a cover page, then every sheet at the stage the child is on.' } } },
  render: () => <PackScreen options={packFromParams(new URLSearchParams('name=Tara&icon=🦄&subitising=2&counting=1&numerals=2&comparison=1&adding=1&rote=1'))} />,
};

export const AllTitles: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <ul className="flex flex-col gap-2 text-grape">
      {Object.values(SHEETS).map((sheet) => (
        <li key={sheet.id} className="rounded-2xl bg-cream p-4">
          <b>{sheet.title}</b>
          <p className="text-sm text-grape/70">{sheet.blurb}</p>
        </li>
      ))}
    </ul>
  ),
};
