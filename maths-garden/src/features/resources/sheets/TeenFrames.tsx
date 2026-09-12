import { numberWord } from '@/features/games/sound';
import { A4Page } from '../A4Page';
import type { SheetMeta, SheetOptions } from './catalog';
import { gameLink, sheetTitle } from './GuideSheet';
import { QrBadge } from './QrBadge';

const TenFrame = ({ icon, filled = 10, size = 11 }: { icon: string; filled?: number; size?: number }) => (
  <div className="grid gap-[0.8mm]" style={{ gridTemplateColumns: `repeat(5, ${size}mm)` }}>
    {Array.from({ length: 10 }, (_, i) => (
      <span
        key={i}
        style={{ width: `${size}mm`, height: `${size}mm` }}
        className={`flex items-center justify-center rounded-[1.5mm] border-[0.5mm] text-[6mm] leading-none ${i < filled ? 'border-bubble bg-blush' : 'border-dashed border-petal'}`}
      >
        {i < filled ? (icon === 'dot' ? <span className="block size-[5mm] rounded-full bg-bubble" /> : icon) : ''}
      </span>
    ))}
  </div>
);

/** Ten-and-some cards, and a mat to build teen numbers on. */
export function TeenFrames({ meta, options }: { meta: SheetMeta; options: SheetOptions }) {
  const { from, to } = meta.stages[options.stage];
  const icon = options.icon === 'dot' ? 'dot' : options.icon;
  const numbers = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const pages = Array.from({ length: Math.ceil(numbers.length / 4) }, (_, i) => numbers.slice(i * 4, i * 4 + 4));
  const caption = `${sheetTitle(meta, options.name)} · Stage ${options.stage}`;
  const footer = <QrBadge url={gameLink(meta)} label="Scan to check it in Ten and Some More" />;

  return (
    <>
      {pages.map((page, p) => (
        <A4Page
          key={p}
          header={
            <>
              <span>{caption}</span>
              <span>Cut out · say “ten and three makes thirteen”</span>
            </>
          }
          footer={footer}
        >
          <div className="grid min-h-0 flex-1 grid-rows-4 gap-[3mm]">
            {page.map((n) => (
              <div key={n} className="flex items-center gap-[4mm] rounded-[4mm] border-[0.5mm] border-dashed border-bubble/70 p-[4mm]">
                <TenFrame icon={icon} />
                <span className="text-[5mm] font-semibold text-grape/60">and</span>
                <span className="flex w-[30mm] flex-wrap gap-[1.5mm]">
                  {Array.from({ length: n - 10 }, (_, i) =>
                    icon === 'dot' ? <span key={i} className="block size-[7mm] rounded-full bg-bubble" /> : <span key={i} className="text-[8mm] leading-none">{icon}</span>,
                  )}
                </span>
                <span className="ml-auto text-right">
                  <span className="block text-[16mm] font-bold leading-none text-raspberry">{n}</span>
                  <span className="block text-[3.6mm] font-medium">{numberWord(n)}</span>
                </span>
              </div>
            ))}
          </div>
        </A4Page>
      ))}

      <A4Page
        header={
          <>
            <span>{caption}</span>
            <span>Build it: ten first, then the extras</span>
          </>
        }
        footer={footer}
      >
        <h2 className="text-[7mm] font-semibold text-raspberry">Build a teen number</h2>
        <p className="text-[3.6mm] text-grape/70">
          Fill the ten frame first — always all ten — then put the extras in the box beside it. Say it the helpful way round: “ten and four makes fourteen.”
        </p>
        <div className="mt-[6mm] flex flex-1 flex-col items-center justify-center gap-[8mm]">
          <div className="flex items-center gap-[6mm]">
            <TenFrame icon="dot" filled={0} size={20} />
            <span className="text-[8mm] font-semibold text-grape/60">and</span>
            <span className="h-[42mm] w-[52mm] rounded-[4mm] border-[0.8mm] border-dashed border-bubble" />
          </div>
          <p className="text-[6mm] font-semibold">
            ten and <span className="inline-block h-[12mm] w-[20mm] rounded-[2mm] border-[0.6mm] border-dashed border-bubble align-middle" /> makes
            <span className="ml-[3mm] inline-block h-[12mm] w-[24mm] rounded-[2mm] border-[0.6mm] border-dashed border-bubble align-middle" />
          </p>
        </div>
      </A4Page>
    </>
  );
}
