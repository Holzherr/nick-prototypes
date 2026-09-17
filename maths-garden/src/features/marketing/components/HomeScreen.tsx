import { stageAge } from '@/features/curriculum/skills';
import { GAMES } from '@/features/games/catalog';
import { useT } from '@/features/i18n/i18n';
import { StartCard } from '@/features/personalise/StartCard';
import { buttonVariants } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import { ARTICLES } from '../articles';
import { FAQ } from '../faq';
import { RESOURCE_MENU } from '../menu';
import { faqAnswer, faqQuestion, gameAbout, gameName, printableDescription, printableTitle, skillName } from '@/features/i18n/content';

// The copy itself lives in the string catalogue; only the emoji and the key stay here.
const WHY = [
  { emoji: '🖨', key: 'paper' },
  { emoji: '🎯', key: 'level' },
  { emoji: '📋', key: 'next' },
  { emoji: '💝', key: 'free' },
] as const;

const STEPS = [
  { emoji: '🖨', key: 'print' },
  { emoji: '📱', key: 'check' },
  { emoji: '🌟', key: 'moveUp' },
  { emoji: '📬', key: 'nextStage' },
] as const;

/**
 * `dir="auto"` on every section: while some strings are translated and some are not, an English paragraph
 * inside an Arabic page would otherwise inherit RTL and hang its full stop off the left-hand end. Letting
 * the browser infer direction per block from its own first strong character costs nothing once everything
 * is translated, and keeps the half-way state readable.
 */
const Section = ({ id, children, className }: { id?: string; children: React.ReactNode; className?: string }) => (
  <section id={id} dir="auto" className={cn('mx-auto max-w-[1100px] scroll-mt-6 px-5', className)}>
    {children}
  </section>
);

/** The front door: what it is, why it is different, how the loop works, what you get, the guides and the FAQ. */
export function HomeScreen() {
  const t = useT();
  return (
    <main>
      <Section className="pt-6 text-center sm:pt-10">
        <StartCard />
        <p className="mx-auto mt-10 max-w-[620px] text-[clamp(17px,2.2vw,21px)] leading-relaxed text-grape/80">
          {t('home.blurb', { games: GAMES.length })}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href="#/resources" className={buttonVariants({ variant: 'quiet', size: 'lg' })}>
            {t('home.browsePrintables')}
          </a>
        </div>
        <p className="mt-4 text-sm text-grape/60">{t('home.noAccountNeeded')}</p>
      </Section>

      <Section className="mt-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {WHY.map((item) => (
            <div key={item.key} className="rounded-[32px] bg-cream p-6 candy-petal [--candy:9px]">
              <span className="text-3xl">{item.emoji}</span>
              <h2 className="mt-2 text-2xl font-semibold text-raspberry">{t(`why.${item.key}.title`)}</h2>
              <p className="mt-1 text-grape/80">{t(`why.${item.key}.text`)}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="how" className="mt-16">
        <h2 className="text-center text-[clamp(26px,4vw,40px)] font-bold text-raspberry">{t('how.title')}</h2>
        <p className="mx-auto mt-2 max-w-[620px] text-center text-grape/75">
          {t('how.standfirst')}
        </p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.key} className="rounded-[28px] bg-blush/70 p-5">
              <span className="text-3xl">{step.emoji}</span>
              <h3 className="mt-1 text-xl font-semibold">
                {i + 1}. {t(`how.${step.key}.title`)}
              </h3>
              <p className="mt-1 text-sm text-grape/80">{t(`how.${step.key}.text`)}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="printables" className="mt-16">
        <h2 className="text-center text-[clamp(26px,4vw,40px)] font-bold text-raspberry">{t('resources.title')}</h2>
        <p className="mx-auto mt-2 max-w-[620px] text-center text-grape/75">
          {t('resources.standfirst')}
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {RESOURCE_MENU.map(({ skill, printables }) => (
            <div key={skill.id} className="rounded-[28px] bg-cream p-5 candy-petal [--candy:8px]">
              <h3 className="text-xl font-semibold text-raspberry">
                {skill.emoji} {skillName(skill.id)}
              </h3>
              {printables.map((printable) => (
                <div key={printable.id} className="mt-2">
                  <b>{printableTitle(printable.id)}</b>
                  <p className="text-sm text-grape/75">{printableDescription(printable.id)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {printable.stages.map((stage) => (
                      <a key={stage} href={printable.link?.(stage)} className={buttonVariants({ variant: 'quiet', size: 'sm' })}>
                        {t('resources.stage', { stage })} · {stageAge(skill.id, stage)}
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
            {t('nav.allPrintables')}
          </a>
        </p>
      </Section>

      <Section className="mt-16">
        <h2 className="text-center text-[clamp(26px,4vw,40px)] font-bold text-raspberry">{t('games.title', { games: GAMES.length })}</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {GAMES.map((game) => (
            <div key={game.id} className="w-[210px] rounded-[26px] bg-cream p-4 text-center candy-petal [--candy:7px]">
              <span className="text-4xl">{game.emoji}</span>
              <h3 className="mt-1 font-semibold">{gameName(game.id)}</h3>
              <p className="text-sm text-grape/75">{gameAbout(game.id)}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="guides" className="mt-16">
        <h2 className="text-center text-[clamp(26px,4vw,40px)] font-bold text-raspberry">{t('guides.title')}</h2>
        <p className="mx-auto mt-2 max-w-[620px] text-center text-grape/75">
          {t('guides.standfirst')} <span className="text-grape/55">{t('guides.englishOnly')}</span>
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {ARTICLES.map((article) => (
            <a key={article.slug} href={`#/guides/${article.slug}`} className="rounded-[32px] bg-cream p-6 transition-transform candy-petal [--candy:9px] hover:-translate-y-0.5">
              <span className="text-3xl">{article.emoji}</span>
              <h3 className="mt-2 text-2xl font-semibold text-raspberry">{article.title}</h3>
              <p className="mt-1 text-grape/80">{article.standfirst}</p>
              <p className="mt-3 text-sm font-semibold text-bubble">{t('guides.minutes', { minutes: article.minutes })}</p>
            </a>
          ))}
        </div>
      </Section>

      <Section id="faq" className="mt-16">
        <h2 className="text-center text-[clamp(26px,4vw,40px)] font-bold text-raspberry">{t('faq.title')}</h2>
        <div className="mx-auto mt-8 max-w-[760px] overflow-hidden rounded-[32px] bg-cream candy-petal [--candy:9px]">
          {FAQ.map((item, i) => (
            <details key={item.question} className="group border-b-2 border-dashed border-petal last:border-b-0">
              <summary className="cursor-pointer list-none px-6 py-4 text-lg font-semibold text-grape marker:hidden hover:text-raspberry">
                <span className="mr-2 inline-block text-bubble transition-transform group-open:rotate-90">▸</span>
                {faqQuestion(i)}
              </summary>
              <div className="px-6 pb-5 pl-12 text-grape/85">
                <p>{faqAnswer(i)}</p>
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
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-bold text-raspberry">{t('cta.title')}</h2>
          <p className="mx-auto mt-2 max-w-[560px] text-grape/80">
            {t('cta.text')}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="#/resources" className={buttonVariants({ size: 'lg' })}>
              {t('cta.printables')}
            </a>
            <a href="#/login" className={buttonVariants({ variant: 'quiet', size: 'lg' })}>
              {t('cta.account')}
            </a>
          </div>
        </div>
      </Section>
    </main>
  );
}
