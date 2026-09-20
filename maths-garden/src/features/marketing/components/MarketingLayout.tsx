import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { FeedbackButton } from '@/features/feedback/FeedbackButton';
import { printableTitle, skillName } from '@/features/i18n/content';
import { useT } from '@/features/i18n/i18n';
import { LanguagePicker } from '@/features/i18n/LanguagePicker';
import { useTheme } from '@/features/personalise/player';
import { ThemeMark } from '@/features/personalise/ThemeMark';
import { Logo } from '@/shared/brand/Logo';
import { buttonVariants } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import { ARTICLES } from '../articles';
import { RESOURCE_MENU } from '../menu';

const navClass = 'rounded-full px-3 py-2 font-semibold text-grape/80 transition-colors hover:bg-blush hover:text-raspberry';
const itemClass = 'block w-full rounded-2xl px-3 py-2 text-left transition-colors hover:bg-blush';

const NavLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} className={navClass}>
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
  <button type="button" onClick={() => jump(id)} className={navClass}>
    {children}
  </button>
);

/**
 * Whether the header has room for its links in one row: Tailwind's `sm`, 640px.
 *
 * Read from JS rather than `hidden sm:flex`, so the phone header and the wide one are two renders and
 * never both in the DOM — a screen reader would meet every link twice, and a test cannot see what a
 * stylesheet hides. jsdom has no matchMedia; without one the wide header is assumed.
 */
const WIDE = '(min-width: 640px)';
const wideQuery = () => (typeof window.matchMedia === 'function' ? window.matchMedia(WIDE) : null);
const subscribeWide = (fn: () => void) => {
  const query = wideQuery();
  query?.addEventListener('change', fn);
  return () => query?.removeEventListener('change', fn);
};
const useWide = () => useSyncExternalStore(subscribeWide, () => wideQuery()?.matches ?? true, () => true);

/**
 * A trigger and the panel under it: a backdrop that closes it on a tap anywhere, then a cream card. The
 * children get `close` so picking something shuts the panel as well as navigating.
 */
function Menu({ label, children }: { label: string; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div className="relative">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={navClass}>
        {label} <span aria-hidden>▾</span>
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close menu" className="fixed inset-0 z-10 cursor-default" onClick={close} />
          <div className="absolute right-0 z-20 mt-2 w-[320px] rounded-[28px] bg-cream p-4 text-left candy-petal [--candy:8px]">{children(close)}</div>
        </>
      )}
    </div>
  );
}

/** Every printable by skill, then the whole catalogue. */
function PrintablesMenu() {
  const t = useT();
  return (
    <Menu label={t('nav.freePrintables')}>
      {(close) => (
        <>
          <ul className="flex flex-col">
            {RESOURCE_MENU.map(({ skill, printables }) => (
              <li key={skill.id}>
                {printables.map((printable) => (
                  <a key={printable.id} href={printable.link?.(1)} onClick={close} className={itemClass}>
                    <b>
                      {skill.emoji} {printableTitle(printable.id)}
                    </b>
                    <span className="block text-sm text-grape/70">{skillName(skill.id)}</span>
                  </a>
                ))}
              </li>
            ))}
          </ul>
          <a href="#/resources" onClick={close} className={cn(buttonVariants({ variant: 'quiet', size: 'sm' }), 'mt-2 w-full')}>
            {t('nav.allPrintables')}
          </a>
        </>
      )}
    </Menu>
  );
}

/**
 * The phone header's one menu: the four links and the language picker, in the order the wide header
 * shows them. On a phone the row wrapped to two — Free printables / How it works / Guides, then FAQ /
 * language / Sign in — so a child creating a profile met six adult links before the name field.
 * Free printables goes to the catalogue page rather than opening a second panel inside this one.
 */
function PhoneMenu() {
  const t = useT();
  const jumpAnd = (close: () => void, id: string) => () => {
    close();
    jump(id);
  };
  return (
    <Menu label={t('nav.menu')}>
      {(close) => (
        <>
          <ul className="flex flex-col font-semibold text-grape">
            <li>
              <a href="#/resources" onClick={close} className={itemClass}>
                {t('nav.freePrintables')}
              </a>
            </li>
            <li>
              <button type="button" onClick={jumpAnd(close, 'how')} className={itemClass}>
                {t('nav.howItWorks')}
              </button>
            </li>
            <li>
              <a href={`#/guides/${ARTICLES[0].slug}`} onClick={close} className={itemClass}>
                {t('nav.guides')}
              </a>
            </li>
            <li>
              <button type="button" onClick={jumpAnd(close, 'faq')} className={itemClass}>
                {t('nav.faq')}
              </button>
            </li>
          </ul>
          <LanguagePicker className="mt-3 block px-3" />
        </>
      )}
    </Menu>
  );
}

/** Header, with the free-resources menu, plus the footer. Wraps every signed-out page. */
export function MarketingLayout({ children }: { children: ReactNode }) {
  const t = useT();
  const wide = useWide();
  const theme = useTheme();

  return (
    <div className="relative z-10 min-h-dvh">
      <header className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-x-2 gap-y-3 px-5 py-5">
        {/* On a phone the wordmark goes: logo, Menu and Sign in run to ~425px in English and wider in
            Polish, so with it the row wrapped and Sign in fell under the logo. The heading right below
            says Maths Garden; the link keeps its name for a screen reader. */}
        <a href="#/home" aria-label={t('nav.home')} className="mr-auto">
          {wide ? <Logo size={42} /> : <ThemeMark theme={theme} size={42} />}
        </a>

        {wide ? (
          <>
            <PrintablesMenu />
            <NavJump id="how">{t('nav.howItWorks')}</NavJump>
            <NavLink href={`#/guides/${ARTICLES[0].slug}`}>{t('nav.guides')}</NavLink>
            <NavJump id="faq">{t('nav.faq')}</NavJump>
            <LanguagePicker />
          </>
        ) : (
          <PhoneMenu />
        )}
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
        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-xs text-grape/50">
          <p>{t('footer.madeBy')}</p>
          <nav aria-label="Legal" className="flex gap-4">
            <a href="#/terms" className="underline hover:text-raspberry">
              {t('footer.terms')}
            </a>
            <a href="#/privacy" className="underline hover:text-raspberry">
              {t('footer.privacy')}
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
