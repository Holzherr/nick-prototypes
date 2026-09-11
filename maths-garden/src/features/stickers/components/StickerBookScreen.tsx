import { possessive } from '@/features/children/model';
import type { StickerRecord } from '@/features/progress/model';
import { Button } from '@/shared/components/ui/button';
import { collected, isSpecial, packProgress, PACKS, SPECIAL_PACK, STICKER_TOTAL, type Pack } from '../catalog';
import { NovaAvatar } from './NovaCelebration';
import { EmptySlot, StickerBadge } from './StickerBadge';

export interface StickerBookScreenProps {
  childName: string;
  stickers: readonly StickerRecord[];
  onHome: () => void;
}

/**
 * Home button + "Tara's stickers", then Nova's gold special stickers (once there are any), then one cream page
 * per pack: collected stickers (with ×n and sparkle), dashed "?" slots, a green "Complete!" badge and the
 * sparkly count that becomes the next goal.
 */
export function StickerBookScreen({ childName, stickers, onHome }: StickerBookScreenProps) {
  const owned = collected(stickers);
  const regular = stickers.filter((s) => !isSpecial(s.sticker));
  const special = stickers.length - regular.length;
  const different = [...owned.keys()].filter((id) => !isSpecial(id)).length;

  const page = (pack: Pack, header: React.ReactNode, gold = false) => (
    <section key={pack.id} className={gold ? 'rounded-[36px] bg-[#fff6d6] p-[clamp(16px,3vw,28px)] candy-sunny [--candy:10px]' : 'rounded-[36px] bg-cream p-[clamp(16px,3vw,28px)] candy-petal [--candy:10px]'}>
      <h2 className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xl font-semibold">{header}</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] justify-items-center gap-5">
        {pack.stickers.map((s) => {
          const o = owned.get(s.id);
          return o ? <StickerBadge key={s.id} sticker={s} size={88} shiny={o.shiny} count={o.count} /> : <EmptySlot key={s.id} size={88} />;
        })}
      </div>
    </section>
  );

  return (
    <div className="relative z-10 min-h-dvh px-5 pb-12 pt-[max(16px,env(safe-area-inset-top))]">
      <header className="mx-auto flex max-w-[900px] items-center gap-4">
        <Button variant="quiet" size="icon" aria-label="Home" onClick={onHome}>
          🏠
        </Button>
        <div>
          <h1 className="text-[clamp(28px,5vw,48px)] font-bold leading-tight text-raspberry">{possessive(childName)} stickers</h1>
          <p className="text-lg text-grape/70">
            {stickers.length === 0
              ? 'Finish a game to get your first sticker!'
              : `${regular.length} sticker${regular.length === 1 ? '' : 's'} · ${different} of ${STICKER_TOTAL} different${special ? ` · ${special} special` : ''}`}
          </p>
        </div>
      </header>
      <div className="mx-auto mt-6 flex max-w-[900px] flex-col gap-7">
        {special > 0 &&
          page(
            SPECIAL_PACK,
            <>
              <NovaAvatar size={40} /> Special stickers from Nova{' '}
              <span className="text-base font-medium text-grape/60">
                {packProgress(SPECIAL_PACK, stickers).have} / {SPECIAL_PACK.stickers.length}
              </span>
            </>,
            true,
          )}
        {PACKS.map((pack) => {
          const p = packProgress(pack, regular);
          return page(
            pack,
            <>
              {pack.cover} {pack.name}{' '}
              <span className="text-base font-medium text-grape/60">
                {p.have} / {p.total}
              </span>
              {p.complete && <span className="rounded-full bg-leaf px-3 py-0.5 text-sm font-semibold text-white">Complete!</span>}
              {p.complete && (
                <span className="text-base font-medium text-grape/70">
                  ✨ Sparkly {p.sparkly} / {p.total}
                  {p.sparklyComplete ? ' 🎉' : ''}
                </span>
              )}
            </>,
          );
        })}
      </div>
    </div>
  );
}
