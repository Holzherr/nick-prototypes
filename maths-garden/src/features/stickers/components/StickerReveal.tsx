import { withArticle, type Sticker } from '../catalog';
import { StickerBadge } from './StickerBadge';

/** The sticker just won, big (150px) and popping in, with "You got a rainbow sticker!" underneath. */
export const StickerReveal = ({ sticker, shiny = false }: { sticker: Sticker; shiny?: boolean }) => (
  <div className="flex flex-col items-center gap-3">
    <div className="animate-pop-in">
      <StickerBadge sticker={sticker} shiny={shiny} size={150} />
    </div>
    <p className="text-[clamp(22px,3.4vw,30px)] font-semibold">
      You got {withArticle(sticker.name)} sticker!{shiny ? ' It’s sparkly!' : ''}
    </p>
  </div>
);
