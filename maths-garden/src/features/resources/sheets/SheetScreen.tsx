import { useState } from 'react';
import { Logo } from '@/shared/brand/Logo';
import { BondFrames } from './BondFrames';
import { SHEETS, type SheetId, type SheetOptions } from './catalog';
import { CountingMats } from './CountingMats';
import { GuideSheet } from './GuideSheet';
import { MoreOrFewer } from './MoreOrFewer';
import { NumberTrack } from './NumberTrack';
import { NumeralCards } from './NumeralCards';
import { SheetOptionsPanel } from './SheetOptionsPanel';
import { TakeAwayStories } from './TakeAwayStories';
import { TeenFrames } from './TeenFrames';
import { UnicornStories } from './UnicornStories';

const VIEWS = {
  'counting-mats': CountingMats,
  'numeral-cards': NumeralCards,
  'more-or-fewer': MoreOrFewer,
  'unicorn-stories': UnicornStories,
  'bond-frames': BondFrames,
  'take-away-stories': TakeAwayStories,
  'teen-frames': TeenFrames,
  'number-track': NumberTrack,
} satisfies Record<SheetId, unknown>;

/** Roughly how many A4 pages a sheet makes, for the panel's summary. */
const PAGES: Record<SheetId, (to: number) => number> = {
  'counting-mats': (to) => 1 + Math.ceil(to / 2),
  'numeral-cards': (to) => 3 + Math.ceil((to + 1) / 8),
  'more-or-fewer': () => 3,
  'unicorn-stories': () => 4,
  'bond-frames': (to) => 2 + Math.ceil((to - 1) / 5),
  'take-away-stories': () => 4,
  'teen-frames': (to) => 2 + Math.ceil((to - 10) / 4),
  'number-track': () => 3,
};

/** Sheet maker: options on the left (top on phones), live A4 previews on the right; printing hides everything but the pages. */
export function SheetScreen({ initial }: { initial: SheetOptions }) {
  const [options, setOptions] = useState(initial);
  const meta = SHEETS[options.id];
  const Sheet = VIEWS[options.id];

  return (
    <div className="relative z-10 min-h-dvh px-4 pb-16 pt-[max(16px,env(safe-area-inset-top))] print:p-0">
      <header className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 print:hidden">
        <a href="#/resources" className="text-lg font-semibold text-raspberry">
          ← Free printables
        </a>
        <Logo size={40} />
      </header>
      <h1 className="mx-auto mt-4 max-w-[1180px] text-[clamp(28px,4vw,40px)] font-bold text-raspberry print:hidden">{meta.title}</h1>
      <p className="mx-auto max-w-[1180px] text-grape/75 print:hidden">{meta.blurb} Pick the options, check the preview, print.</p>

      <div className="mx-auto mt-5 flex max-w-[1180px] flex-col gap-6 lg:flex-row lg:items-start print:block print:max-w-none">
        <SheetOptionsPanel
          options={options}
          meta={meta}
          pageCount={PAGES[options.id](meta.stages[options.stage].to)}
          onChange={setOptions}
          onPrint={() => window.print()}
          className="shrink-0 print:hidden lg:sticky lg:top-4 lg:w-[340px]"
        />
        <div className="flex min-w-0 flex-1 flex-col items-center gap-6 overflow-x-auto pb-4 print:block print:overflow-visible print:p-0">
          <GuideSheet meta={meta} options={options} />
          <Sheet meta={meta} options={options} />
        </div>
      </div>
    </div>
  );
}
