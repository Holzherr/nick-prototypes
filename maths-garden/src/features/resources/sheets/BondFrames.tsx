import { A4Page } from '../A4Page';
import type { SheetMeta, SheetOptions } from './catalog';
import { gameLink, sheetTitle } from './GuideSheet';
import { QrBadge } from './QrBadge';

/** A five or ten frame with `filled` boxes taken, the rest dashed and waiting. */
function Frame({ capacity, filled, icon }: { capacity: number; filled: number; icon: string }) {
  const cell = capacity <= 5 ? 17 : 14;
  return (
    <div className="grid gap-[1mm]" style={{ gridTemplateColumns: `repeat(5, ${cell}mm)` }}>
      {Array.from({ length: capacity }, (_, i) => (
        <span
          key={i}
          style={{ width: `${cell}mm`, height: `${cell}mm` }}
          className={`flex items-center justify-center rounded-[2mm] border-[0.6mm] text-[8mm] leading-none ${i < filled ? 'border-bubble bg-blush' : 'border-dashed border-petal'}`}
        >
          {i < filled ? (icon === 'dot' ? <span className="block size-[7mm] rounded-full bg-bubble" /> : icon) : ''}
        </span>
      ))}
    </div>
  );
}

/** Every pair that makes the whole, smallest part first, without the trivial 0 and whole. */
const pairs = (whole: number) => Array.from({ length: whole - 1 }, (_, i) => i + 1);

/** Frames to fill, then bond cards to cut out and answer without the frame. */
export function BondFrames({ meta, options }: { meta: SheetMeta; options: SheetOptions }) {
  const { to } = meta.stages[options.stage];
  const whole = to;
  const all = pairs(whole);
  const caption = `${sheetTitle(meta, options.name)} · Stage ${options.stage}`;
  const footer = <QrBadge url={gameLink(meta)} label="Scan to check it in Make Ten" />;
  const perPage = 5;
  const pages = Array.from({ length: Math.ceil(all.length / perPage) }, (_, i) => all.slice(i * perPage, (i + 1) * perPage));

  return (
    <>
      {pages.map((page, p) => (
        <A4Page
          key={p}
          header={
            <>
              <span>{caption}</span>
              <span>Fill the frame, then say the pair out loud</span>
            </>
          }
          footer={footer}
        >
          <h2 className="text-[7mm] font-semibold text-raspberry">How many more to make {whole}?</h2>
          <p className="text-[3.6mm] text-grape/70">
            Put a counter in each empty box. Then say it: “{page[0]} and {whole - page[0]} make {whole}.”
          </p>
          <div className="mt-[3mm] flex min-h-0 flex-1 flex-col justify-between">
            {page.map((shown) => (
              <div key={shown} className="flex items-center gap-[5mm] rounded-[5mm] border-[0.6mm] border-petal p-[4mm]">
                <Frame capacity={whole <= 5 ? 5 : 10} filled={shown} icon={options.icon} />
                <span className="flex flex-1 items-baseline justify-end gap-[2mm] text-[6mm] font-semibold">
                  {shown} and
                  <span className="inline-block h-[12mm] w-[18mm] rounded-[2mm] border-[0.6mm] border-dashed border-bubble" />
                  make {whole}
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
            <span>Cut out · answers in the corner</span>
          </>
        }
        footer={footer}
      >
        <h2 className="text-[7mm] font-semibold text-raspberry">Bond cards</h2>
        <p className="text-[3.6mm] text-grape/70">No frame this time. Shuffle them and go for speed — that is the stage the game checks.</p>
        <div className="mt-[3mm] grid min-h-0 flex-1 grid-cols-2 gap-[3mm]">
          {all.map((shown) => (
            <div key={shown} className="relative flex items-center justify-center rounded-[4mm] border-[0.5mm] border-dashed border-bubble/70">
              <span className="text-[14mm] font-bold text-raspberry">
                {shown} + <span className="text-bubble">?</span> = {whole}
              </span>
              <span className="absolute bottom-[2mm] right-[3mm] text-[3.4mm] text-grape/45">{whole - shown}</span>
            </div>
          ))}
        </div>
      </A4Page>
    </>
  );
}
