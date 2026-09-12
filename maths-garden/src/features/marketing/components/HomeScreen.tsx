import { GAMES } from '@/features/games/catalog';
import { AppIcon } from '@/shared/brand/AppIcon';
import { buttonVariants } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import { ARTICLES } from '../articles';
import { FAQ } from '../faq';
import { RESOURCE_MENU } from '../menu';

const WHY = [
  {
    emoji: '🖨',
    title: 'Paper first, screen second',
    text: 'The teaching happens away from the tablet: dot cards, counting mats, tracing, a number hunt. The games are the check, not the lesson.',
  },
  {
    emoji: '🎯',
    title: 'It finds the right level',
    text: 'Every round is scored on accuracy and speed, so the questions sit where your child gets about four in five right — hard enough to be worth doing, easy enough to stay fun.',
  },
  {
    emoji: '📋',
    title: 'You get told what to do next',
    text: 'A plain-English report says what they are good at, what needs work, and exactly which sheet to print next — emailed to you when they move up a stage.',
  },
  {
    emoji: '💝',
    title: 'Free, and quiet',
    text: 'No ads, no purchases, no notifications, no streaks to lose, no leaderboards. Nothing is sold and nothing needs an app store.',
  },
];

const STEPS = [
  ['🖨', 'Print', 'Pick a skill and a stage and print the sheet. Play it at the table with real objects — five minutes is plenty.'],
  ['📱', 'Check', 'Scan the QR code on the sheet, or open the app. Five questions, about two minutes, scored as they go.'],
  ['🌟', 'Move up', 'A quick perfect round, or two good ones, moves that skill up a level. The garden grows a flower for every round.'],
  ['📬', 'Print the next stage', 'When a skill crosses into a new stage you get an email with the report and links to the sheets that suit them now.'],
] as const;

const Section = ({ id, children, className }: { id?: string; children: React.ReactNode; className?: string }) => (
  <section id={id} className={cn('mx-auto max-w-[1100px] scroll-mt-6 px-5', className)}>
    {children}
  </section>
);

/** The front door: what it is, why it is different, how the loop works, what you get, the guides and the FAQ. */
export function HomeScreen() {
  return (
    <main>
      <Section className="pt-6 text-center sm:pt-10">
        <AppIcon size={84} className="mx-auto" />
        <h1 className="mt-5 text-[clamp(34px,6.5vw,64px)] font-bold leading-[1.05] text-raspberry">
          Early maths that starts
          <br className="hidden sm:block" /> on paper, not on a screen
        </h1>
        <p className="mx-auto mt-4 max-w-[620px] text-[clamp(17px,2.2vw,21px)] leading-relaxed text-grape/80">
          Free printables and five small games for three- to six-year-olds. Print a sheet, play it together, then let the app check what stuck — it scores every
          round, moves your child up when they are ready, and tells you what to print next.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a href="#/login" className={buttonVariants({ size: 'lg' })}>
            Start free
          </a>
          <a href="#/resources" className={buttonVariants({ variant: 'quiet', size: 'lg' })}>
            🖨 Browse the printables
          </a>
        </div>
        <p className="mt-4 text-sm text-grape/60">No account needed for printables · no ads · works offline on an iPad</p>
      </Section>

      <Section className="mt-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {WHY.map((item) => (
            <div key={item.title} className="rounded-[32px] bg-cream p-6 candy-petal [--candy:9px]">
              <span className="text-3xl">{item.emoji}</span>
              <h2 className="mt-2 text-2xl font-semibold text-raspberry">{item.title}</h2>
              <p className="mt-1 text-grape/80">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="how" className="mt-16">
        <h2 className="text-center text-[clamp(26px,4vw,40px)] font-bold text-raspberry">How it works</h2>
        <p className="mx-auto mt-2 max-w-[620px] text-center text-grape/75">
          One loop, repeated. Paper teaches, the game marks, the level moves, the next sheet arrives.
        </p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([emoji, title, text], i) => (
            <li key={title} className="rounded-[28px] bg-blush/70 p-5">
              <span className="text-3xl">{emoji}</span>
              <h3 className="mt-1 text-xl font-semibold">
                {i + 1}. {title}
              </h3>
              <p className="mt-1 text-sm text-grape/80">{text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="printables" className="mt-16">
        <h2 className="text-center text-[clamp(26px,4vw,40px)] font-bold text-raspberry">Free resources</h2>
        <p className="mx-auto mt-2 max-w-[620px] text-center text-grape/75">
          Every sheet is personalised with your child’s name and a picture they like, in three stages. No sign-in, no email, no watermark.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {RESOURCE_MENU.map(({ skill, printables }) => (
            <div key={skill.id} className="rounded-[28px] bg-cream p-5 candy-petal [--candy:8px]">
              <h3 className="text-xl font-semibold text-raspberry">
                {skill.emoji} {skill.name}
              </h3>
              {printables.map((printable) => (
                <div key={printable.id} className="mt-2">
                  <b>{printable.title}</b>
                  <p className="text-sm text-grape/75">{printable.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {printable.stages.map((stage) => (
                      <a key={stage} href={printable.link?.(stage)} className={buttonVariants({ variant: 'quiet', size: 'sm' })}>
                        Stage {stage}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className="mt-6 text-center">
          <a href="#/resources" className={buttonVariants({ size: 'md' })}>
            All printables →
          </a>
        </p>
      </Section>

      <Section className="mt-16">
        <h2 className="text-center text-[clamp(26px,4vw,40px)] font-bold text-raspberry">And five games that mark themselves</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {GAMES.map((game) => (
            <div key={game.id} className="w-[210px] rounded-[26px] bg-cream p-4 text-center candy-petal [--candy:7px]">
              <span className="text-4xl">{game.emoji}</span>
              <h3 className="mt-1 font-semibold">{game.name}</h3>
              <p className="text-sm text-grape/75">{game.about}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="guides" className="mt-16">
        <h2 className="text-center text-[clamp(26px,4vw,40px)] font-bold text-raspberry">Guides for grown-ups</h2>
        <p className="mx-auto mt-2 max-w-[620px] text-center text-grape/75">The research behind all of this, including the bits that argue against apps like this one.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {ARTICLES.map((article) => (
            <a key={article.slug} href={`#/guides/${article.slug}`} className="rounded-[32px] bg-cream p-6 transition-transform candy-petal [--candy:9px] hover:-translate-y-0.5">
              <span className="text-3xl">{article.emoji}</span>
              <h3 className="mt-2 text-2xl font-semibold text-raspberry">{article.title}</h3>
              <p className="mt-1 text-grape/80">{article.standfirst}</p>
              <p className="mt-3 text-sm font-semibold text-bubble">{article.minutes} min read →</p>
            </a>
          ))}
        </div>
      </Section>

      <Section id="faq" className="mt-16">
        <h2 className="text-center text-[clamp(26px,4vw,40px)] font-bold text-raspberry">Questions</h2>
        <div className="mx-auto mt-8 max-w-[760px] overflow-hidden rounded-[32px] bg-cream candy-petal [--candy:9px]">
          {FAQ.map((item) => (
            <details key={item.question} className="group border-b-2 border-dashed border-petal last:border-b-0">
              <summary className="cursor-pointer list-none px-6 py-4 text-lg font-semibold text-grape marker:hidden hover:text-raspberry">
                <span className="mr-2 inline-block text-bubble transition-transform group-open:rotate-90">▸</span>
                {item.question}
              </summary>
              <div className="px-6 pb-5 pl-12 text-grape/85">
                <p>{item.answer}</p>
                {item.link && (
                  <a href={item.link.href} className="mt-2 inline-block font-semibold text-raspberry underline">
                    {item.link.label} →
                  </a>
                )}
              </div>
            </details>
          ))}
        </div>
      </Section>

      <Section className="mt-16">
        <div className="rounded-[36px] bg-petal/60 p-8 text-center">
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-bold text-raspberry">Print a sheet tonight, play it tomorrow</h2>
          <p className="mx-auto mt-2 max-w-[560px] text-grape/80">
            Start with the printables — they need no account at all. When you want the scores kept, the games take about ten seconds to set up.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="#/resources" className={buttonVariants({ size: 'lg' })}>
              🖨 Free printables
            </a>
            <a href="#/login" className={buttonVariants({ variant: 'quiet', size: 'lg' })}>
              Create a free account
            </a>
          </div>
        </div>
      </Section>
    </main>
  );
}
