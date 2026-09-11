import { possessive } from '@/features/children/model';
import { STAGES, type CardOptions } from './cards';
import { A4Page } from './PrintSheet';

const GAMES = [
  ['Quick peek', 'Show a card for 1–2 seconds, hide it, ask “How many?” Then ask “How did you see it?” — that talk is where the learning happens.'],
  ['Turn and check', 'Your child says the number, then flips the card to check the answer on the back. Works solo once the game is familiar.'],
  ['Snap', 'Two piles; snap when two cards show the same number, even in different patterns.'],
  ['Match up', 'Lay out dot cards and numeral cards face up; pair each picture with its number.'],
  ['Line up', 'Put the cards in order from smallest to biggest. Then shuffle and race the clock.'],
] as const;

/** The first printed page: title, stage goal, five games to play with the cards, and when to move on. */
export function GuidePage({ options }: { options: CardOptions }) {
  const stage = STAGES[options.stage];
  const title = options.name ? `${possessive(options.name)} Quick Peek cards` : 'Quick Peek cards';
  return (
    <A4Page>
      <div className="flex flex-1 flex-col gap-[6mm] text-[4mm] leading-snug">
        <div>
          <p className="text-[4mm] font-semibold uppercase tracking-wide text-bubble">Maths Garden · free printable</p>
          <h1 className="text-[11mm] font-bold leading-tight text-raspberry">{title}</h1>
          <p className="mt-[2mm] text-[5mm] font-semibold">
            Stage {options.stage} · numbers {stage.label}
          </p>
          <p>{stage.goal}</p>
        </div>

        <div>
          <h2 className="mb-[2mm] text-[6mm] font-semibold text-raspberry">What subitising is</h2>
          <p>
            Knowing how many there are at a glance, without counting one by one — the way you read a dice. It is one of the best early predictors of later
            arithmetic, and it grows fastest in short, playful bursts: 5 minutes, a few times a week.
          </p>
        </div>

        <div>
          <h2 className="mb-[2mm] text-[6mm] font-semibold text-raspberry">Games to play</h2>
          <ol className="flex list-decimal flex-col gap-[2mm] pl-[6mm]">
            {GAMES.map(([name, how]) => (
              <li key={name}>
                <b>{name}.</b> {how}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h2 className="mb-[2mm] text-[6mm] font-semibold text-raspberry">Tips</h2>
          <ul className="flex list-disc flex-col gap-[1.5mm] pl-[6mm]">
            <li>Flash, don’t linger: with time to count, it becomes a counting game.</li>
            <li>Mix the patterns so no single picture gets memorised.</li>
            <li>Plain dots are best for learning; pictures make it more fun. Use both.</li>
            <li>Stop while it is still fun.</li>
          </ul>
        </div>

        <div className="mt-auto rounded-[4mm] bg-blush p-[5mm]">
          <h2 className="mb-[1mm] text-[6mm] font-semibold text-raspberry">When to move on</h2>
          <p>
            When 8 out of 10 flashes are right, quickly, two sessions running, go to the next stage. To check, play <b>Quick Peek</b> in Maths Garden on an
            iPad or phone: two rounds at 80%+ unlocks the next level, and the grown-ups screen links to that stage’s cards.
          </p>
        </div>
      </div>
    </A4Page>
  );
}
