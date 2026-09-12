import { A4Page } from '../A4Page';
import type { Sheet } from './cards';
import { SubitisingCard } from './SubitisingCard';

export { A4Page };

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
