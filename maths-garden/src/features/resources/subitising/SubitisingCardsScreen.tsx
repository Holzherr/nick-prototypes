import { useMemo, useState } from 'react';
import { possessive } from '@/features/children/model';
import { Logo } from '@/shared/brand/Logo';
import { buildCards, paginate, STAGES, type CardOptions } from './cards';
import { CardOptionsPanel } from './CardOptionsPanel';
import { GuidePage } from './GuidePage';
import { PrintSheet } from './PrintSheet';

/** Card maker: options on the left (top on phones), live A4 previews on the right; printing hides everything but the pages. */
export function SubitisingCardsScreen({ initial }: { initial: CardOptions }) {
  const [options, setOptions] = useState(initial);
  const cards = useMemo(() => buildCards(options), [options]);
  const sheets = useMemo(() => paginate(cards, options.size, options.answers === 'back'), [cards, options.size, options.answers]);
  const caption = `${options.name ? `${possessive(options.name)} ` : ''}Quick Peek cards · Stage ${options.stage} (${STAGES[options.stage].label})`;

  return (
    <div className="relative z-10 min-h-dvh px-4 pb-16 pt-[max(16px,env(safe-area-inset-top))] print:p-0">
      <header className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 print:hidden">
        <a href="#/resources" className="text-lg font-semibold text-raspberry">
          ← Free printables
        </a>
        <Logo size={40} />
      </header>
      <h1 className="mx-auto mt-4 max-w-[1180px] text-[clamp(28px,4vw,40px)] font-bold text-raspberry print:hidden">Quick Peek dot cards</h1>
      <p className="mx-auto max-w-[1180px] text-grape/75 print:hidden">Subitising flash cards. Pick the options, check the preview, print.</p>

      <div className="mx-auto mt-5 flex max-w-[1180px] flex-col gap-6 lg:flex-row lg:items-start print:block print:max-w-none">
        <CardOptionsPanel
          options={options}
          onChange={setOptions}
          cardCount={cards.length}
          pageCount={sheets.length}
          onPrint={() => window.print()}
          className="shrink-0 print:hidden lg:sticky lg:top-4 lg:w-[340px]"
        />
        <div className="flex min-w-0 flex-1 flex-col items-center gap-6 overflow-x-auto pb-4 print:block print:overflow-visible print:p-0">
          {options.guide && <GuidePage options={options} />}
          {sheets.map((sheet, i) => (
            <PrintSheet key={i} sheet={sheet} icon={options.icon} name={options.name} answerCorner={options.answers === 'corner'} caption={caption} />
          ))}
        </div>
      </div>
    </div>
  );
}
