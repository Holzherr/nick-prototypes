import { possessive } from '@/features/children/model';
import type { StickerRecord } from '@/features/progress/model';
import { Button } from '@/shared/components/ui/button';
import { collected, PACKS, STICKER_TOTAL } from '../catalog';
import { EmptySlot, StickerBadge } from './StickerBadge';

export interface StickerBookScreenProps {
  childName: string;
  stickers: readonly StickerRecord[];
  onHome: () => void;
}

/** Home button + "Tara's stickers", then one cream page per pack: collected stickers (with ×n and sparkle) and dashed "?" slots for the rest. */
export function StickerBookScreen({ childName, stickers, onHome }: StickerBookScreenProps) {
  const owned = collected(stickers);
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
              : `${stickers.length} sticker${stickers.length === 1 ? '' : 's'} · ${owned.size} of ${STICKER_TOTAL} different`}
          </p>
        </div>
      </header>
      <div className="mx-auto mt-6 flex max-w-[900px] flex-col gap-7">
        {PACKS.map((pack) => {
          const have = pack.stickers.filter((s) => owned.has(s.id)).length;
          return (
            <section key={pack.id} className="rounded-[36px] bg-cream p-[clamp(16px,3vw,28px)] candy-petal [--candy:10px]">
              <h2 className="mb-4 text-2xl font-semibold">
                {pack.cover} {pack.name} <span className="text-base font-medium text-grape/60">{have} / {pack.stickers.length}</span>
              </h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] justify-items-center gap-5">
                {pack.stickers.map((s) => {
                  const o = owned.get(s.id);
                  return o ? <StickerBadge key={s.id} sticker={s} size={88} shiny={o.shiny} count={o.count} /> : <EmptySlot key={s.id} size={88} />;
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
