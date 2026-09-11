import { PACKS, type PackId } from '../catalog';
import { StickerBadge } from './StickerBadge';

/** "Choose a sticker!" and one cream card per pack, each showing a fan of three of its stickers and the pack name. */
export const PackChooser = ({ onPick }: { onPick: (pack: PackId) => void }) => (
  <section className="flex flex-col items-center gap-4">
    <h2 className="text-[clamp(22px,3.4vw,30px)] font-semibold">Choose a sticker!</h2>
    <div className="flex flex-wrap justify-center gap-[clamp(12px,2.5vw,22px)]">
      {PACKS.map((pack) => (
        <button
          key={pack.id}
          type="button"
          onClick={() => onPick(pack.id)}
          className="flex w-[clamp(150px,26vw,210px)] flex-col items-center gap-2 rounded-[32px] bg-cream px-3 pb-5 pt-4 candy-petal [--candy:10px] transition-transform active:translate-y-1.5 active:[--candy:4px]"
        >
          <span className="relative block h-[92px] w-full">
            {pack.stickers.slice(0, 3).map((s, i) => (
              <span key={s.id} className="absolute top-2" style={{ left: `calc(50% - 34px + ${(i - 1) * 36}px)`, zIndex: i === 1 ? 2 : 1 }}>
                <StickerBadge sticker={s} size={68} />
              </span>
            ))}
          </span>
          <span className="text-[clamp(17px,2.4vw,22px)] font-semibold">{pack.name}</span>
        </button>
      ))}
    </div>
  </section>
);
