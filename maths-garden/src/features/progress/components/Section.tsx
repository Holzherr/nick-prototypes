import { useState, type ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

export interface SectionProps {
  /** Emoji shown before the title, so a section is findable at a glance. */
  icon: string;
  title: string;
  /** One line under the title, readable while the section is shut — the reason to open it. */
  summary: string;
  /** Open on first render; used for the section a parent most often wants. */
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * One tap-to-open card on the grown-ups screen. Everything used to render expanded in a single column —
 * account, actions, motivation, eight skill rows, the weekly check-in and the voice picker — so the screen
 * ran for several phone-heights and the thing you came for was never on it. Each section now states what it
 * holds in one line and opens only when asked.
 *
 * A plain <details> would be shorter, but the summary marker and open/shut animation differ across Safari
 * and Chrome, and the chevron has to sit at the end of a two-line heading on a narrow screen.
 */
export function Section({ icon, title, summary, defaultOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="mt-3 overflow-hidden rounded-[24px] bg-blush/45">
      <button
        type="button"
        onClick={() => setOpen((was) => !was)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors active:bg-blush/70"
      >
        <span aria-hidden className="text-2xl leading-none">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold text-raspberry">{title}</span>
          <span className="mt-0.5 block text-sm text-grape/70">{summary}</span>
        </span>
        <span aria-hidden className={cn('shrink-0 text-xl text-grape/50 transition-transform', open && 'rotate-90')}>
          ›
        </span>
      </button>
      {open && <div className="px-4 pb-5">{children}</div>}
    </section>
  );
}
