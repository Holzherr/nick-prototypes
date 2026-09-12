import { possessive } from '@/features/children/model';
import { stageAge } from '@/features/curriculum/skills';
import { gameById } from '@/features/games/catalog';
import { A4Page } from '../A4Page';
import { appUrl } from '../qr';
import type { SheetMeta, SheetOptions } from './catalog';
import { QrBadge } from './QrBadge';

/** Where the sheet's QR code goes: straight into the game that checks the same skill. */
export const gameLink = (meta: SheetMeta) => (meta.game ? appUrl(`#/play/${meta.game}`) : appUrl('#/'));

export const sheetTitle = (meta: SheetMeta, name: string) => (name ? `${possessive(name)} ${meta.title.toLowerCase()}` : meta.title);

/** First page of every sheet: what it is for, what to do with it, and how to know when to move on. */
export function GuideSheet({ meta, options }: { meta: SheetMeta; options: SheetOptions }) {
  const stage = meta.stages[options.stage];
  const game = meta.game ? gameById(meta.game) : null;

  return (
    <A4Page>
      <div className="flex flex-1 flex-col gap-[6mm] text-[4mm] leading-snug">
        <div>
          <p className="text-[4mm] font-semibold uppercase tracking-wide text-bubble">Maths Garden · free printable</p>
          <h1 className="text-[11mm] font-bold leading-tight text-raspberry">{sheetTitle(meta, options.name)}</h1>
          <p className="mt-[2mm] text-[5mm] font-semibold">
            Stage {options.stage} · {stage.label} · usually ages {stageAge(meta.skill, options.stage)}
          </p>
          <p>{stage.goal}</p>
          <p className="text-grape/70">Ages are typical, not a target: start where your child gets about four out of five right.</p>
        </div>

        <div>
          <h2 className="mb-[2mm] text-[6mm] font-semibold text-raspberry">What it is for</h2>
          <p>{meta.blurb}</p>
        </div>

        <div>
          <h2 className="mb-[2mm] text-[6mm] font-semibold text-raspberry">What to do</h2>
          <ol className="flex list-decimal flex-col gap-[2mm] pl-[6mm]">
            {meta.how.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </div>

        <div>
          <h2 className="mb-[2mm] text-[6mm] font-semibold text-raspberry">Tips</h2>
          <ul className="flex list-disc flex-col gap-[1.5mm] pl-[6mm]">
            <li>Five minutes, often, beats half an hour once a week.</li>
            <li>Say the numbers out loud together — the talking is where the learning happens.</li>
            <li>A wrong answer is information, not a problem. Show it with objects and move on.</li>
            <li>Stop while it is still fun.</li>
          </ul>
        </div>

        <div className="mt-auto flex items-center justify-between gap-[6mm] rounded-[4mm] bg-blush p-[5mm]">
          <div>
            <h2 className="mb-[1mm] text-[6mm] font-semibold text-raspberry">When to move on</h2>
            <p>
              {game ? (
                <>
                  Play <b>{game.name}</b> in Maths Garden to check. Two rounds in a row at 80%+ (or one quick perfect round) moves the level up, and the
                  grown-ups screen then links to the next stage of this sheet.
                </>
              ) : (
                <>When she can do it without help two days running, print the next stage. The weekly check-in on the grown-ups screen scores this one by hand.</>
              )}
            </p>
          </div>
          <QrBadge url={gameLink(meta)} label={game ? `Scan to play ${game.name}` : 'Scan to open Maths Garden'} size={22} />
        </div>
      </div>
    </A4Page>
  );
}
