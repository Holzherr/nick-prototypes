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
              <div className="mt-2 flex flex-wrap gap-2">
                {skill.stages.map((s) => (
                  <span key={s.stage} className="rounded-full bg-blush px-3 py-1 text-sm" title={s.goal}>
                    Stage {s.stage} · {s.range}
                  </span>
                ))}
              </div>
              <ul className="mt-4 flex flex-col gap-3">
                {printablesFor(skill.id).map((p) => (
                  <li key={p.id} className={cn('flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4', p.status === 'ready' ? 'bg-petal/50' : 'bg-blush/60')}>
                    <div className="min-w-[220px] flex-1">
                      <b className="text-lg">{p.title}</b>
                      <p className="text-sm text-grape/75">{p.description}</p>
                    </div>
                    {p.status === 'ready' && p.link ? (
                      <div className="flex flex-wrap gap-2">
                        {p.stages.map((stage) => (
                          <a key={stage} href={p.link?.(stage)} className={buttonVariants({ size: 'sm' })}>
                            Stage {stage}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="rounded-full bg-white px-3 py-1 text-sm text-grape/60">Coming soon</span>
                    )}
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
