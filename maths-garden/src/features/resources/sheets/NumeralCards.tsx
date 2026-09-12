import { numberWord } from '@/features/games/sound';
import { A4Page } from '../A4Page';
import { layout } from '../subitising/patterns';
import { Pattern } from '../subitising/Pattern';
import type { SheetMeta, SheetOptions } from './catalog';
import { gameLink, sheetTitle } from './GuideSheet';
import { QrBadge } from './QrBadge';

const FONT = 'Fredoka, ui-rounded, system-ui, sans-serif';

/** A numeral card: the number, its word, and the same number of dots so the symbol means something. */
const NumeralCard = ({ n, icon, name }: { n: number; icon: string; name: string }) => (
  <svg viewBox="0 0 100 72" className="block h-full max-h-full w-full max-w-full" fontFamily={FONT} role="img" aria-label={`Numeral ${n}`}>
    <rect x={0.8} y={0.8} width={98.4} height={70.4} rx={6} fill="#fffdf9" stroke="#e7a9c1" strokeWidth={0.8} />
    <text x={30} y={34} fontSize={38} fontWeight={700} fill="#e0326e" textAnchor="middle" dominantBaseline="central">
      {n}
    </text>
    <text x={30} y={58} fontSize={7} fontWeight={500} fill="#6b2d5c" textAnchor="middle">
      {numberWord(n)}
    </text>
    <g transform="translate(52 8) scale(0.46)">
      {n > 0 && <Pattern layout={layout(Math.min(n, 10), n <= 6 ? 'dice' : 'frame', n)} icon={icon} />}
    </g>
    {name && (
      <text x={5} y={68} fontSize={3.4} fill="#6b2d5c" opacity={0.55}>
        {name}
      </text>
    )}
  </svg>
);

/** A dotted number to trace: three tries, with a start dot for where the pencil goes first. */
const TraceRow = ({ n }: { n: number }) => (
  <div className="flex items-center gap-[6mm] border-b-[0.4mm] border-dashed border-petal py-[2mm]">
    <span className="w-[18mm] text-[8mm] font-bold text-raspberry">{n}</span>
    <svg viewBox="0 0 180 40" className="h-[22mm] flex-1" fontFamily={FONT} role="img" aria-label={`Trace the number ${n} three times`}>
      {[0, 60, 120].map((x) => (
        <g key={x}>
          <text x={x + 18} y={20} fontSize={34} fontWeight={700} fill="none" stroke="#ffb3d0" strokeWidth={1.2} strokeDasharray="3 3" textAnchor="middle" dominantBaseline="central">
            {n}
          </text>
          <circle cx={x + 8} cy={4} r={1.6} fill="#ff7bac" />
        </g>
      ))}
    </svg>
  </div>
);

/** Numeral cards (8 to a page), tracing practice, and a number hunt to take out of the house. */
export function NumeralCards({ meta, options }: { meta: SheetMeta; options: SheetOptions }) {
  const { from, to } = meta.stages[options.stage];
  const numbers = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const cardPages = Array.from({ length: Math.ceil(numbers.length / 8) }, (_, i) => numbers.slice(i * 8, i * 8 + 8));
  const traceNumbers = numbers.filter((n) => n > 0).slice(0, 9);
  const caption = `${sheetTitle(meta, options.name)} · Stage ${options.stage}`;
  const footer = <QrBadge url={gameLink(meta)} label="Scan to check it in Find the Number" />;

  return (
    <>
      {cardPages.map((page, i) => (
        <A4Page key={i} header={<><span>{caption}</span><span>Cut along the pink lines</span></>} footer={footer}>
          <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-4">
            {page.map((n) => (
              <div key={n} className="flex min-h-0 items-center justify-center p-[1.5mm]">
                <NumeralCard n={n} icon={options.icon} name={options.name} />
              </div>
            ))}
          </div>
        </A4Page>
      ))}

      <A4Page header={<><span>{caption}</span><span>Trace with a finger first, then a pencil</span></>} footer={footer}>
        <h2 className="text-[7mm] font-semibold text-raspberry">Trace the numbers</h2>
        <p className="text-[3.6mm] text-grape/70">Start on the pink dot. Say the number out loud every time you write it.</p>
        <div className="mt-[2mm] flex min-h-0 flex-1 flex-col justify-between">
          {traceNumbers.map((n) => (
            <TraceRow key={n} n={n} />
          ))}
        </div>
      </A4Page>

      <A4Page header={<><span>{caption}</span><span>Take it out with you</span></>} footer={footer}>
        <h2 className="text-[7mm] font-semibold text-raspberry">Number hunt</h2>
        <p className="text-[3.6mm] text-grape/70">Front doors, buses, lift buttons, price labels, the microwave. Tick each number you spot and say it out loud.</p>
        <div className="mt-[4mm] grid min-h-0 flex-1 grid-cols-2 gap-x-[8mm] gap-y-[1mm] content-start">
          {numbers.map((n) => (
            <div key={n} className="flex items-center gap-[3mm] border-b-[0.4mm] border-dashed border-petal py-[1.6mm]">
              <span className="w-[12mm] text-[7mm] font-bold text-raspberry">{n}</span>
              <span className="size-[7mm] shrink-0 rounded-[1.5mm] border-[0.5mm] border-bubble" />
              <span className="flex-1 text-[3.2mm] text-grape/50">where did you see it?</span>
            </div>
          ))}
        </div>
      </A4Page>
    </>
  );
}
