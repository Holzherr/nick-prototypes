import { useState, type ReactNode } from 'react';
import { FeedbackButton } from '@/features/feedback/FeedbackButton';
import { printableTitle, skillName } from '@/features/i18n/content';
import { useT } from '@/features/i18n/i18n';
import { LanguagePicker } from '@/features/i18n/LanguagePicker';
import { Logo } from '@/shared/brand/Logo';
import { buttonVariants } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import { ARTICLES } from '../articles';
import { RESOURCE_MENU } from '../menu';

const NavLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} className="rounded-full px-3 py-2 font-semibold text-grape/80 transition-colors hover:bg-blush hover:text-raspberry">
    {children}
  </a>
);

/** Sections live on the homepage, so jumping to one means scrolling there, or going home first. */
function jump(id: string) {
  const target = document.getElementById(id);
  if (target) return target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.location.hash = '#/home';
}

const NavJump = ({ id, children }: { id: string; children: ReactNode }) => (
  <button type="button" onClick={() => jump(id)} className="rounded-full px-3 py-2 font-semibold text-grape/80 transition-colors hover:bg-blush hover:text-raspberry">
    {children}
  </button>
);

/** Header, with the free-resources menu, plus the footer. Wraps every signed-out page. */
export function MarketingLayout({ children }: { children: ReactNode }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-10 min-h-dvh">
      <header className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-x-2 gap-y-3 px-5 py-5">
        <a href="#/home" aria-label={t('nav.home')} className="mr-auto">
          <Logo size={42} />
        </a>

        <div className="relative">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="rounded-full px-3 py-2 font-semibold text-grape/80 transition-colors hover:bg-blush hover:text-raspberry"
          >
            {t('nav.freePrintables')} ▾
          </button>
          {open && (
            <>
              <button type="button" aria-label="Close menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-[320px] rounded-[28px] bg-cream p-4 text-left candy-petal [--candy:8px]">
                <ul className="flex flex-col">
                  {RESOURCE_MENU.map(({ skill, printables }) => (
                    <li key={skill.id}>
                      {printables.map((printable) => (
                        <a
                          key={printable.id}
                          href={printable.link?.(1)}
                          onClick={() => setOpen(false)}
                          className="block rounded-2xl px-3 py-2 transition-colors hover:bg-blush"
                        >
                          <b>
                            {skill.emoji} {printableTitle(printable.id)}
                          </b>
                          <span className="block text-sm text-grape/70">{skillName(skill.id)}</span>
                        </a>
                      ))}
                    </li>
                  ))}
                </ul>
                <a href="#/resources" onClick={() => setOpen(false)} className={cn(buttonVariants({ variant: 'quiet', size: 'sm' }), 'mt-2 w-full')}>
                  {t('nav.allPrintables')}
                </a>
              </div>
            </>
          )}
        </div>

        <NavJump id="how">{t('nav.howItWorks')}</NavJump>
        <NavLink href={`#/guides/${ARTICLES[0].slug}`}>{t('nav.guides')}</NavLink>
        <NavJump id="faq">{t('nav.faq')}</NavJump>
        <LanguagePicker />
        <a href="#/login" className={buttonVariants({ size: 'sm' })}>
          {t('nav.signIn')}
        </a>
      </header>

      {children}

      <footer className="mx-auto mt-16 max-w-[1100px] px-5 pb-12">
        <div className="flex flex-wrap items-start justify-between gap-6 border-t-2 border-dashed border-petal pt-8 text-sm text-grape/70">
          <div className="max-w-[320px]">
            <Logo size={34} />
            <p className="mt-2">{t('footer.blurb')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-grape">{t('footer.printables')}</h3>
            <ul className="mt-1 flex flex-col gap-1">
              {RESOURCE_MENU.slice(0, 4).map(({ skill, printables }) => (
                <li key={skill.id}>
                  <a href={printables[0].link?.(1)} className="hover:text-raspberry">
                    {printableTitle(printables[0].id)}
                  </a>
                </li>
              ))}
              <li>
                <a href="#/resources" className="font-semibold hover:text-raspberry">
                  {t('nav.allPrintables')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-grape">{t('footer.guides')}</h3>
            <ul className="mt-1 flex flex-col gap-1">
              {ARTICLES.map((article) => (
                <li key={article.slug}>
                  <a href={`#/guides/${article.slug}`} className="hover:text-raspberry">
                    {article.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-grape">{t('footer.getStarted')}</h3>
            <ul className="mt-1 flex flex-col gap-1">
              <li>
                <a href="#/login" className="hover:text-raspberry">
                  {t('footer.signIn')}
                </a>
              </li>
              <li>
                <button type="button" onClick={() => jump('faq')} className="hover:text-raspberry">
                  {t('footer.questions')}
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <FeedbackButton />
        </div>
        <p className="mt-8 text-xs text-grape/50">{t('footer.madeBy')}</p>
      </footer>
    </div>
  );
}
