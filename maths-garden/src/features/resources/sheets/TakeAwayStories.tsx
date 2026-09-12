import { mulberry32 } from '@/shared/utils/random';
import { A4Page } from '../A4Page';
import type { SheetMeta, SheetOptions } from './catalog';
import { gameLink, sheetTitle } from './GuideSheet';
import { QrBadge } from './QrBadge';

const COUNTERS = 24;
const STORIES = 6;

/** "Five balloons, two float away" — every pair that stays inside the stage, shuffled, then the first six. */
function buildTakeAways(from: number, to: number, takeMax: number, stage: number): [number, number][] {
  const candidates: [number, number][] = [];
  for (let base = Math.max(from, 2); base <= to; base++) {
    for (let taken = 1; taken <= Math.min(takeMax, base - 1); taken++) candidates.push([base, taken]);
  }
  const rng = mulberry32(stage * 641 + to);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates.slice(0, STORIES);
}

const Row = ({ n, icon }: { n: number; icon: string }) => <span className="text-[7mm] leading-none tracking-[1mm]">{icon.repeat(n)}</span>;

/** The sky board, balloons to cut out, and story lines where things float away. */
export function TakeAwayStories({ meta, options }: { meta: SheetMeta; options: SheetOptions }) {
  const { from, to } = meta.stages[options.stage];
  const icon = options.icon === 'dot' ? '🎈' : options.icon;
  const takeMax = options.stage === 1 ? 1 : options.stage === 2 ? 2 : 3;
  const stories = buildTakeAways(from, to, takeMax, options.stage);
  const caption = `${sheetTitle(meta, options.name)} · Stage ${options.stage}`;
  const footer = <QrBadge url={gameLink(meta)} label="Scan to check it in One Fewer" />;

  return (
    <>
      <A4Page
        header={
          <>
            <span>{caption}</span>
            <span>The sky: stick the balloons here</span>
          </>
        }
        footer={footer}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8mm] border-[1mm] border-bubble bg-[#eef6ff]">
          <div className="flex items-start justify-between p-[6mm]">
            <p className="text-[6mm] font-semibold text-raspberry">Up in the sky</p>
            <p className="text-[4mm] text-grape/60">{options.name}</p>
          </div>
          <div className="flex flex-1 items-start justify-around px-[6mm] text-[10mm] opacity-25">
            {'☁️☁️☁️'.split('').map((cloud, i) => (
              <span key={i}>{cloud}</span>
            ))}
          </div>
          <div className="flex h-[26mm] items-end justify-around border-t-[1mm] border-dashed border-bubble/60 pb-[3mm] text-[6mm] text-grape/50">
            <span>🏠</span>
            <span>🌳</span>
            <span>🏠</span>
            <span>🌳</span>
          </div>
        </div>
        <p className="mt-[4mm] text-[4mm] text-grape/70">
          Put some {icon} in the sky and count them. Then let one float away and ask “how many are left?” — count back from the number you had, do not start again.
        </p>
      </A4Page>

      <A4Page
        header={
          <>
            <span>{caption}</span>
            <span>Cut out the balloons</span>
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
            <span>Cross them out, then write how many are left</span>
          </>
        }
        footer={footer}
      >
        <h2 className="text-[7mm] font-semibold text-raspberry">Floating away</h2>
        <p className="text-[3.6mm] text-grape/70">Cross out the ones that float away, then write how many are left in the box.</p>
        <div className="mt-[3mm] flex min-h-0 flex-1 flex-col justify-between">
          {stories.map(([base, taken], i) => (
            <div key={i} className="flex items-center gap-[4mm] rounded-[5mm] border-[0.6mm] border-petal p-[4mm]">
              <span className="w-[8mm] text-[5mm] font-bold text-bubble">{i + 1}</span>
              <span className="flex flex-1 flex-wrap items-center gap-[2mm]">
                <Row n={base} icon={icon} />
                <span className="text-[6mm] font-semibold text-grape/60">
                  and {taken} float{taken === 1 ? 's' : ''} away, so there {base - taken === 1 ? 'is' : 'are'}
                </span>
              </span>
              <span className="h-[16mm] w-[24mm] shrink-0 rounded-[3mm] border-[0.6mm] border-dashed border-bubble" />
            </div>
          ))}
        </div>
        <p className="mt-[3mm] text-[2.8mm] text-grape/45">Answers: {stories.map(([b, t], i) => `${i + 1}. ${b - t}`).join(' · ')}</p>
      </A4Page>
    </>
  );
}
