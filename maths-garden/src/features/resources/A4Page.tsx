import type { ReactNode } from 'react';

/** An A4 page (210 × 297mm, 10mm margin): white on screen with a shadow, one page per sheet when printed. */
export const A4Page = ({ children, header, footer }: { children: ReactNode; header?: ReactNode; footer?: ReactNode }) => (
  <section className="sheet-preview flex h-[296mm] w-[210mm] shrink-0 break-after-page flex-col bg-white p-[10mm] text-grape shadow-[0_6px_24px_rgba(107,45,92,0.18)] print:shadow-none">
    {header && <div className="mb-[2mm] flex justify-between text-[3mm] text-grape/60">{header}</div>}
    {children}
    {footer && <div className="mt-[4mm] flex items-end justify-between gap-[4mm] border-t border-petal pt-[3mm] text-[3mm] text-grape/60">{footer}</div>}
  </section>
);
