import type { ReactNode } from 'react';
import type { Sheet } from './cards';
import { SubitisingCard } from './SubitisingCard';

/** An A4 page (210 × 297mm, 10mm margin): white on screen with a shadow, one page per sheet when printed. */
export const A4Page = ({ children, header }: { children: ReactNode; header?: ReactNode }) => (
  <section className="sheet-preview flex h-[296mm] w-[210mm] shrink-0 break-after-page flex-col bg-white p-[10mm] text-grape shadow-[0_6px_24px_rgba(107,45,92,0.18)] print:shadow-none">
    {header && <div className="mb-[2mm] flex justify-between text-[3mm] text-grape/60">{header}</div>}
    {children}
  </section>
);

export interface PrintSheetProps {
  sheet: Sheet;
  icon: string;
  name?: string;
  answerCorner?: boolean;
  caption: string;
}

/** A sheet of cards in a grid (2 × 4 small or 1 × 2 large); back sheets say how to print double-sided. */
export const PrintSheet = ({ sheet, icon, name, answerCorner, caption }: PrintSheetProps) => (
  <A4Page
    header={
      <>
        <span>{caption}</span>
        <span>{sheet.side === 'back' ? 'Answers: print double-sided, flip on long edge' : 'Cut along the pink lines'}</span>
      </>
    }
  >
    <div className="grid min-h-0 flex-1" style={{ gridTemplateColumns: `repeat(${sheet.columns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${sheet.rows}, minmax(0, 1fr))` }}>
      {sheet.cells.map((face, k) => (
        <div key={k} className="flex min-h-0 items-center justify-center p-[1.5mm]">
          {face && <SubitisingCard face={face} icon={icon} name={name} answerCorner={answerCorner && sheet.side === 'front'} />}
        </div>
      ))}
    </div>
  </A4Page>
);
