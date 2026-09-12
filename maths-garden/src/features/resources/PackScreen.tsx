import { possessive } from '@/features/children/model';
import { SKILLS } from '@/features/curriculum/skills';
import { Logo } from '@/shared/brand/Logo';
import { Button } from '@/shared/components/ui/button';
import { A4Page } from './A4Page';
import { SHEET_FOR_SKILL, type PackOptions } from './pack';
import { SHEETS } from './sheets/catalog';
import { CountingMats } from './sheets/CountingMats';
import { GuideSheet } from './sheets/GuideSheet';
import { MoreOrFewer } from './sheets/MoreOrFewer';
import { NumberTrack } from './sheets/NumberTrack';
import { NumeralCards } from './sheets/NumeralCards';
import { UnicornStories } from './sheets/UnicornStories';
import { buildCards, DEFAULT_OPTIONS, paginate } from './subitising/cards';
import { PrintSheet } from './subitising/PrintSheet';

const VIEWS = {
  'counting-mats': CountingMats,
  'numeral-cards': NumeralCards,
  'more-or-fewer': MoreOrFewer,
  'unicorn-stories': UnicornStories,
  'number-track': NumberTrack,
};

/** The whole pack for a child's current stages: a cover page, the Quick Peek cards, then every sheet. */
export function PackScreen({ options }: { options: PackOptions }) {
  const { name, icon, stages } = options;
  const cardOptions = { ...DEFAULT_OPTIONS, name, icon, stage: stages.subitising, answers: 'corner' as const, guide: false };
  const cardSheets = paginate(buildCards(cardOptions), cardOptions.size, false);

  return (
    <div className="relative z-10 min-h-dvh px-4 pb-16 pt-[max(16px,env(safe-area-inset-top))] print:p-0">
      <header className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 print:hidden">
        <a href="#/resources" className="text-lg font-semibold text-raspberry">
          ← Free printables
        </a>
        <Logo size={40} />
      </header>
      <div className="mx-auto mt-4 flex max-w-[1180px] flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-[clamp(28px,4vw,40px)] font-bold text-raspberry">{name ? `${possessive(name)} stage pack` : 'Stage pack'}</h1>
          <p className="text-grape/75">Every sheet for the stage {name || 'your child'} is on right now, in one print job. Print it, work through it, then come back for the next one.</p>
        </div>
        <Button size="lg" onClick={() => window.print()}>
          🖨 Print the pack
        </Button>
      </div>

      <div className="mt-5 flex flex-col items-center gap-6 overflow-x-auto pb-4 print:block print:overflow-visible print:p-0">
        <A4Page>
          <div className="flex flex-1 flex-col gap-[6mm] text-[4mm] leading-snug">
            <div>
              <p className="text-[4mm] font-semibold uppercase tracking-wide text-bubble">Maths Garden · free printables</p>
              <h1 className="text-[12mm] font-bold leading-tight text-raspberry">{name ? `${possessive(name)} stage pack` : 'Stage pack'}</h1>
              <p className="mt-[2mm] text-[5mm]">Printed {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <p>
              One sheet per skill, each at the stage {name || 'your child'} is working on. Play the matching game in Maths Garden to check — when a game moves up a
              level, print that skill&rsquo;s next stage. The QR code on each sheet opens its game.
            </p>
            <ul className="flex flex-col gap-[2mm]">
              {SKILLS.map((skill) => (
                <li key={skill.id} className="flex items-baseline justify-between border-b-[0.4mm] border-dashed border-petal pb-[2mm]">
                  <span className="text-[5mm] font-semibold">
                    {skill.emoji} {skill.name}
                  </span>
                  <span>
                    Stage {stages[skill.id]} · {skill.stages[stages[skill.id] - 1].range} · usually {skill.stages[stages[skill.id] - 1].age}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-auto rounded-[4mm] bg-blush p-[5mm]">
              Five minutes a day beats an hour on a Sunday. Say the numbers out loud together, use real objects whenever you can, and stop while it is still fun.
            </p>
          </div>
        </A4Page>

        {cardSheets.map((sheet, i) => (
          <PrintSheet
            key={`cards-${i}`}
            sheet={sheet}
            icon={icon}
            name={name}
            answerCorner
            caption={`${name ? `${possessive(name)} ` : ''}Quick Peek cards · Stage ${stages.subitising}`}
          />
        ))}

        {SKILLS.map((skill) => {
          const id = SHEET_FOR_SKILL[skill.id];
          if (!id) return null;
          const meta = SHEETS[id];
          const Sheet = VIEWS[id];
          const sheetOptions = { id, name, icon, stage: stages[skill.id] };
          return (
            <div key={skill.id} className="contents">
              <GuideSheet meta={meta} options={sheetOptions} />
              <Sheet meta={meta} options={sheetOptions} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
