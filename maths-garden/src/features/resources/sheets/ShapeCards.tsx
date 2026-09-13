import { ShapeCard } from '@/features/games/components/ShapeCard';
import { SHAPES, type ShapeId } from '@/features/games/shapes';
import { A4Page } from '../A4Page';
import type { SheetMeta, SheetOptions } from './catalog';
import { gameLink, sheetTitle } from './GuideSheet';
import { QrBadge } from './QrBadge';

/** The same sets the game's first three levels use, so paper and screen never disagree about the stage. */
const STAGE_SHAPES: Record<1 | 2 | 3, readonly ShapeId[]> = {
  1: ['circle', 'triangle', 'square'],
  2: ['circle', 'oval', 'triangle', 'square', 'rectangle'],
  3: ['circle', 'oval', 'triangle', 'square', 'rectangle', 'pentagon', 'hexagon'],
};

/** Somewhere a four-year-old can actually find each shape. Vague prompts make the hunt collapse. */
const WHERE: Record<ShapeId, string> = {
  circle: 'wheels, plates, buttons, the moon',
  oval: 'eggs, a rugby ball, a running track',
  triangle: 'a slice of pizza, a roof, a give-way sign',
  square: 'floor tiles, windows, a chess board',
  rectangle: 'doors, books, a phone screen',
  rhombus: 'a kite, the diamonds on playing cards',
  pentagon: 'the black patches on a football, a house drawn from the side',
  hexagon: 'honeycomb, bathroom tiles, the end of a pencil',
  octagon: 'a stop sign',
  star: 'stickers, the top of a Christmas tree',
};

/** Cut-out shape cards with their side counts, then a hunt for the same shapes in the real world. */
export function ShapeCards({ meta, options }: { meta: SheetMeta; options: SheetOptions }) {
  const shapes = STAGE_SHAPES[options.stage];
  const pages = Array.from({ length: Math.ceil(shapes.length / 4) }, (_, i) => shapes.slice(i * 4, i * 4 + 4));
  const caption = `${sheetTitle(meta, options.name)} · Stage ${options.stage}`;
  const footer = <QrBadge url={gameLink(meta)} label="Scan to check it in Spot the Shape" />;

  return (
    <>
      {pages.map((page, p) => (
        <A4Page
          key={p}
          header={
            <>
              <span>{caption}</span>
              <span>Cut out · name it, then count the sides</span>
            </>
          }
          footer={footer}
        >
          <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-[4mm]">
            {page.map((id) => (
              <div key={id} className="flex flex-col items-center justify-center gap-[2.5mm] rounded-[4mm] border-[0.5mm] border-dashed border-bubble/70 p-[4mm]">
                <ShapeCard shape={id} fill="#ff7bac" className="h-[46mm] w-[46mm]" />
                <span className="text-[7mm] font-bold leading-none text-raspberry">{SHAPES[id].name}</span>
                <span className="text-[3.8mm] font-medium text-grape/70">
                  {SHAPES[id].sides ? `${SHAPES[id].sides} sides · ${SHAPES[id].sides} corners` : 'no sides, no corners'}
                </span>
              </div>
            ))}
          </div>
        </A4Page>
      ))}

      <A4Page
        header={
          <>
            <span>{caption}</span>
            <span>Shape hunt · tick each one you find</span>
          </>
        }
        footer={footer}
      >
        <h2 className="text-[7mm] font-semibold text-raspberry">Shape hunt</h2>
        <p className="text-[3.6mm] text-grape/70">
          Find each shape on something real and tick it off. Ask how she knew — counting the sides out loud counts as knowing, and is the
          whole point at this stage.
        </p>
        <div className="mt-[5mm] flex min-h-0 flex-1 flex-col gap-[3mm]">
          {shapes.map((id) => (
            <div key={id} className="flex items-center gap-[4mm] rounded-[3mm] border-[0.4mm] border-dashed border-bubble/70 p-[3mm]">
              <ShapeCard shape={id} fill="#ff7bac" className="size-[16mm] shrink-0" />
              <span className="flex-1">
                <span className="block text-[5mm] font-semibold text-raspberry">{SHAPES[id].name}</span>
                <span className="block text-[3.4mm] text-grape/70">Look for: {WHERE[id]}</span>
              </span>
              <span className="size-[12mm] shrink-0 rounded-[2mm] border-[0.6mm] border-dashed border-bubble" />
            </div>
          ))}
        </div>
      </A4Page>
    </>
  );
}
