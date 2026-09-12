import { A4Page } from '../A4Page';
import type { SheetMeta, SheetOptions } from './catalog';
import { buildPairs, scatterSpots } from './content';
import { gameLink, sheetTitle } from './GuideSheet';
import { QrBadge } from './QrBadge';

const ROWS_PER_PAGE = 4;

const Group = ({ n, icon, seed }: { n: number; icon: string; seed: number }) => (
  <svg viewBox="0 0 100 60" className="h-[26mm] w-full" role="img" aria-label={`${n} things`}>
    {scatterSpots(n, seed).map((s, i) =>
      icon === 'dot' ? (
        <circle key={i} cx={s.x} cy={s.y} r={5} fill="#ff7bac" />
      ) : (
        <text key={i} x={s.x} y={s.y} fontSize={11} textAnchor="middle" dominantBaseline="central">
          {icon}
        </text>
      ),
    )}
  </svg>
);

/** Rows of two groups to compare, four to a page, with the answers at the end. */
export function MoreOrFewer({ meta, options }: { meta: SheetMeta; options: SheetOptions }) {
  const { from, to } = meta.stages[options.stage];
  const pairs = buildPairs(from, to, options.stage);
  const pages = Array.from({ length: Math.ceil(pairs.length / ROWS_PER_PAGE) }, (_, i) => pairs.slice(i * ROWS_PER_PAGE, (i + 1) * ROWS_PER_PAGE));
  const caption = `${sheetTitle(meta, options.name)} · Stage ${options.stage}`;

  return (
    <>
      {pages.map((page, p) => (
        <A4Page
          key={p}
          header={
            <>
              <span>{caption}</span>
              <span>Circle the side with more · cross the side with fewer</span>
            </>
          }
          footer={
            <>
              <QrBadge url={gameLink(meta)} label="Scan to check it in Which Has More?" />
              {p === pages.length - 1 && (
                <span className="text-[2.8mm] text-grape/45">
                  Answers: {pairs.map(([a, b], i) => `${i + 1}. ${a === b ? 'same' : a > b ? 'left' : 'right'}`).join(' · ')}
                </span>
              )}
            </>
          }
        >
          <h2 className="text-[7mm] font-semibold text-raspberry">Which has more?</h2>
          <div className="mt-[2mm] flex min-h-0 flex-1 flex-col justify-between">
            {page.map(([a, b], i) => (
              <div key={i} className="flex items-center gap-[3mm] rounded-[5mm] border-[0.6mm] border-petal p-[3mm]">
                <span className="w-[8mm] text-[5mm] font-bold text-bubble">{p * ROWS_PER_PAGE + i + 1}</span>
                <div className="flex-1 rounded-[4mm] bg-blush/60 p-[1mm]">
                  <Group n={a} icon={options.icon} seed={(p * 10 + i) * 31 + a} />
                </div>
                <span className="text-[6mm] font-semibold text-grape/50">or</span>
                <div className="flex-1 rounded-[4mm] bg-blush/60 p-[1mm]">
                  <Group n={b} icon={options.icon} seed={(p * 10 + i) * 57 + b} />
                </div>
              </div>
            ))}
          </div>
        </A4Page>
      ))}
    </>
  );
}
