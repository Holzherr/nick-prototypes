import { A4Page } from '../A4Page';
import type { SheetMeta, SheetOptions } from './catalog';
import { buildStories } from './content';
import { gameLink, sheetTitle } from './GuideSheet';
import { QrBadge } from './QrBadge';

const COUNTERS = 24;

const Row = ({ n, icon }: { n: number; icon: string }) => <span className="text-[7mm] leading-none tracking-[1mm]">{icon.repeat(n)}</span>;

/** The field board, counters to cut out, and story lines to fill in. */
export function UnicornStories({ meta, options }: { meta: SheetMeta; options: SheetOptions }) {
  const { to } = meta.stages[options.stage];
  const icon = options.icon === 'dot' ? '🦄' : options.icon;
  const stories = buildStories(to, options.stage);
  const caption = `${sheetTitle(meta, options.name)} · Stage ${options.stage}`;
  const footer = <QrBadge url={gameLink(meta)} label="Scan to check it in One More Unicorn" />;

  return (
    <>
      <A4Page
        header={
          <>
            <span>{caption}</span>
            <span>The field: put the counters here</span>
          </>
        }
        footer={footer}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8mm] border-[1mm] border-leaf bg-[#eaf9f1]">
          <div className="flex items-start justify-between p-[6mm]">
            <p className="text-[6mm] font-semibold text-leaf-deep">The unicorn field</p>
            <p className="text-[4mm] text-grape/60">{options.name}</p>
          </div>
          <div className="flex flex-1 items-end justify-around pb-[6mm] text-[8mm] opacity-30">
            {'🌷🌼🌸🌻🌷'.split('').map((flower, i) => (
              <span key={i}>{flower}</span>
            ))}
          </div>
          <div className="flex h-[12mm] items-center justify-around border-t-[1mm] border-dashed border-leaf text-[5mm] text-leaf-deep">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i}>|</span>
            ))}
          </div>
        </div>
        <p className="mt-[4mm] text-[4mm] text-grape/70">
          Put some {icon} in the field and count them. Then let one more trot in and ask “how many now?” — count on from the number you had.
        </p>
      </A4Page>

      <A4Page
        header={
          <>
            <span>{caption}</span>
            <span>Cut out the counters</span>
          </>
        }
        footer={footer}
      >
        <div className="grid min-h-0 flex-1 grid-cols-4 grid-rows-6 gap-[2mm]">
          {Array.from({ length: COUNTERS }, (_, i) => (
            <span key={i} className="flex items-center justify-center rounded-[4mm] border-[0.5mm] border-dashed border-bubble/70 text-[14mm]">
              {icon}
            </span>
          ))}
        </div>
      </A4Page>

      <A4Page
        header={
          <>
            <span>{caption}</span>
            <span>Say the story, then write the answer</span>
          </>
        }
        footer={footer}
      >
        <h2 className="text-[7mm] font-semibold text-raspberry">One more unicorn stories</h2>
        <p className="text-[3.6mm] text-grape/70">Read it together, act it out with the counters, then write how many there are altogether.</p>
        <div className="mt-[3mm] flex min-h-0 flex-1 flex-col justify-between">
          {stories.map(([start, extra], i) => (
            <div key={i} className="flex items-center gap-[4mm] rounded-[5mm] border-[0.6mm] border-petal p-[4mm]">
              <span className="w-[8mm] text-[5mm] font-bold text-bubble">{i + 1}</span>
              <span className="flex flex-1 flex-wrap items-center gap-[2mm]">
                <Row n={start} icon={icon} />
                <span className="text-[6mm] font-semibold text-grape/60">and {extra} more</span>
                <Row n={extra} icon={icon} />
                <span className="text-[6mm] font-semibold text-grape/60">makes</span>
              </span>
              <span className="h-[16mm] w-[24mm] shrink-0 rounded-[3mm] border-[0.6mm] border-dashed border-bubble" />
            </div>
          ))}
        </div>
        <p className="mt-[3mm] text-[2.8mm] text-grape/45">Answers: {stories.map(([a, b], i) => `${i + 1}. ${a + b}`).join(' · ')}</p>
      </A4Page>
    </>
  );
}
