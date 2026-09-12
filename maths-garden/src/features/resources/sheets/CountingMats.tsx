import { numberWord } from '@/features/games/sound';
import { A4Page } from '../A4Page';
import type { SheetMeta, SheetOptions } from './catalog';
import { gameLink, sheetTitle } from './GuideSheet';
import { QrBadge } from './QrBadge';

/** One mat: the numeral, its word, and that many spots to put an object on. */
function Mat({ n, icon, name }: { n: number; icon: string; name: string }) {
  const columns = n <= 5 ? n : Math.ceil(n / 2);
  const spot = n <= 5 ? 26 : n <= 8 ? 22 : 18;
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-[6mm] border-[0.8mm] border-dashed border-petal p-[6mm]">
      <header className="flex items-baseline justify-between">
        <p className="text-[7mm] font-semibold text-raspberry">
          Put {n} {icon === 'dot' ? 'things' : icon} on the spots
        </p>
        <p className="text-[4mm] text-grape/60">{name}</p>
      </header>
      <div className="mt-[3mm] flex min-h-0 flex-1 items-center gap-[6mm]">
        <div className="flex size-[30mm] shrink-0 flex-col items-center justify-center rounded-[4mm] bg-blush">
          <span className="text-[16mm] font-bold leading-none text-raspberry">{n}</span>
          <span className="text-[3.6mm] font-medium">{numberWord(n)}</span>
        </div>
        <div className="grid flex-1 justify-items-center gap-[3mm]" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: n }, (_, i) => (
            <span key={i} className="rounded-full border-[0.6mm] border-dashed border-bubble/70 bg-cream" style={{ width: `${spot}mm`, height: `${spot}mm` }} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Counting mats: one mat per number in the stage, two to a page, after the how-to page. */
export function CountingMats({ meta, options }: { meta: SheetMeta; options: SheetOptions }) {
  const { from, to } = meta.stages[options.stage];
  const numbers = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const pages = Array.from({ length: Math.ceil(numbers.length / 2) }, (_, i) => numbers.slice(i * 2, i * 2 + 2));
  const caption = `${sheetTitle(meta, options.name)} · Stage ${options.stage}`;

  return (
    <>
      {pages.map((page, i) => (
        <A4Page
          key={i}
          header={
            <>
              <span>{caption}</span>
              <span>
                Page {i + 1} of {pages.length}
              </span>
            </>
          }
          footer={<QrBadge url={gameLink(meta)} label="Scan to check it in Count With Me" />}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-[6mm]">
            {page.map((n) => (
              <Mat key={n} n={n} icon={options.icon} name={options.name} />
            ))}
          </div>
        </A4Page>
      ))}
    </>
  );
}
