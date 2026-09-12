import { SKILLS } from '@/features/curriculum/skills';
import { Logo } from '@/shared/brand/Logo';
import { buttonVariants } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import { printablesFor } from './catalog';

const STEPS = [
  ['🖨', 'Print', 'Print the cards or game for the stage your child is on. Play little and often, away from the screen.'],
  ['📱', 'Check', 'Play the matching game in Maths Garden on an iPad or phone. It scores every round.'],
  ['🌟', 'Move up', 'Two rounds in a row at 80%+ unlocks the next stage. Print that stage and carry on.'],
] as const;

/** Public page, no sign-in: logo, "Free printables", the print → check → move up loop, then each skill with its stages and printables. */
export function ResourcesScreen() {
  return (
    <div className="relative z-10 min-h-dvh px-4 pb-16 pt-[max(20px,env(safe-area-inset-top))]">
      <div className="mx-auto max-w-[960px]">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Logo size={44} />
          <a href="#/" className={buttonVariants({ variant: 'quiet', size: 'sm' })}>
            Open the games →
          </a>
        </header>

        <h1 className="mt-8 text-[clamp(32px,5vw,52px)] font-bold leading-tight text-raspberry">Free printables</h1>
        <p className="mt-2 max-w-[640px] text-lg text-grape/80">
          Cards and games for early maths, ages 3–6. Personalise them with your child’s name and a favourite picture. Free, no sign-up, no paywall.
        </p>
        <p className="mt-4 max-w-[640px] rounded-[24px] bg-cream p-4 text-grape/80 candy-petal [--candy:6px]">
          <b>Stages, not school years.</b> The ages below are what is typical, not a target — the spread between two perfectly normal children is well over a
          year, and most children sit on different stages for different skills (counting to 12 while still adding within 5). Start at the stage your child gets
          about four out of five right, and move up when that feels easy.
        </p>

        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map(([emoji, title, text], i) => (
            <li key={title} className="rounded-[28px] bg-cream p-5 candy-petal [--candy:8px]">
              <span className="text-3xl">{emoji}</span>
              <h2 className="mt-1 text-xl font-semibold">
                {i + 1}. {title}
              </h2>
              <p className="text-sm text-grape/75">{text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col gap-6">
          {SKILLS.map((skill) => (
            <section key={skill.id} className="rounded-[36px] bg-cream p-[clamp(18px,3vw,30px)] candy-petal [--candy:10px]">
              <h2 className="text-2xl font-semibold text-raspberry">
                {skill.emoji} {skill.name}
              </h2>
              <p className="mt-1 text-sm text-grape/70">
                {printablesFor(skill.id)
                  .filter((p) => p.status === 'ready')
                  .map((p) => p.description)
                  .join(' ')}
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {skill.stages.map((s) => {
                  const ready = printablesFor(skill.id).filter((p) => p.status === 'ready' && p.link && p.stages.includes(s.stage));
                  return (
                    <div key={s.stage} className="flex flex-col rounded-[24px] bg-petal/40 p-4">
                      <div className="flex items-baseline justify-between gap-2">
                        <b className="text-lg">Stage {s.stage}</b>
                        <span className="rounded-full bg-cream px-2.5 py-0.5 text-sm font-semibold text-grape/80">usually {s.age}</span>
                      </div>
                      <p className="mt-0.5 text-sm font-semibold text-raspberry">{s.range}</p>
                      <p className="mt-1 flex-1 text-sm text-grape/80">{s.goal}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {ready.length ? (
                          ready.map((p) => (
                            <a key={p.id} href={p.link?.(s.stage)} className={buttonVariants({ size: 'sm' })}>
                              🖨 Print
                            </a>
                          ))
                        ) : (
                          <span className="rounded-full bg-white px-3 py-1 text-sm text-grape/60">Coming soon</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <ul className={cn('mt-3 flex flex-col gap-2', 'text-sm text-grape/70')}>
                {printablesFor(skill.id)
                  .filter((p) => p.status !== 'ready')
                  .map((p) => (
                    <li key={p.id} className="rounded-2xl bg-blush/60 p-3">
                      <b>{p.title}</b> — {p.description} <span className="text-grape/55">(coming soon)</span>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
