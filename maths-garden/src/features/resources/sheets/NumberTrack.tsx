import { A4Page } from '../A4Page';
import type { SheetMeta, SheetOptions } from './catalog';
import { sheetTitle } from './GuideSheet';
import { QrBadge } from './QrBadge';
import { appUrl } from '../qr';

const PER_ROW = 10;
/** Every fifth square is a flower: land on one and say the number before and after. */
const isFlower = (n: number) => n % 5 === 0;

function Track({ to, icon, blanks }: { to: number; icon: string; blanks: boolean }) {
  const rows = Array.from({ length: Math.ceil(to / PER_ROW) }, (_, r) => Array.from({ length: Math.min(PER_ROW, to - r * PER_ROW) }, (_, c) => r * PER_ROW + c + 1));
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center gap-[6mm]">
      {rows.map((row, r) => (
        <div key={r} className="flex items-center justify-center gap-[2mm]">
          {(r % 2 ? [...row].reverse() : row).map((n) => {
            const hide = blanks && n % 3 === 2 && n !== to;
            return (
              <span
                key={n}
                className={`flex size-[16mm] shrink-0 flex-col items-center justify-center rounded-[4mm] border-[0.6mm] text-[7mm] font-bold ${
                  hide ? 'border-dashed border-bubble text-transparent' : isFlower(n) ? 'border-leaf bg-[#eaf9f1] text-leaf-deep' : 'border-petal bg-cream text-raspberry'
                }`}
              >
                {hide ? '' : n}
                {!hide && isFlower(n) && <span className="text-[3.4mm] leading-none">{icon === 'dot' ? '🌸' : icon}</span>}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** The race track to count along, and the same track with numbers missing to fill in. */
export function NumberTrack({ meta, options }: { meta: SheetMeta; options: SheetOptions }) {
  const { to } = meta.stages[options.stage];
  const caption = `${sheetTitle(meta, options.name)} · Stage ${options.stage}`;
  const footer = <QrBadge url={appUrl('#/')} label="Scan to open Maths Garden" />;

  return (
    <>
      <A4Page header={<><span>{caption}</span><span>Roll, move, say every number out loud</span></>} footer={footer}>
        <div className="flex items-baseline justify-between">
          <h2 className="text-[7mm] font-semibold text-raspberry">Number track race · 1 to {to}</h2>
          <span className="rounded-full bg-leaf px-[4mm] py-[1.5mm] text-[4mm] font-semibold text-white">START → FINISH</span>
        </div>
        <Track to={to} icon={options.icon} blanks={false} />
        <p className="text-[3.6mm] text-grape/70">
          Use a button each as a counter and a dice. Land on a flower and say the number one more and one less. First to {to} wins — then count all the way back
          down.
        </p>
      </A4Page>

      <A4Page header={<><span>{caption}</span><span>Fill in the missing numbers</span></>} footer={footer}>
        <h2 className="text-[7mm] font-semibold text-raspberry">Which numbers are missing?</h2>
        <p className="text-[3.6mm] text-grape/70">Say the track out loud from the start each time. The gaps are where counting usually wobbles.</p>
        <Track to={to} icon={options.icon} blanks />
      </A4Page>
    </>
  );
}
