import { useEffect } from 'react';
import { Burst } from '@/features/games/components/Burst';
import { say } from '@/features/games/sound';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import { withArticle, type Sticker } from '../catalog';
import { StickerReveal } from './StickerReveal';

/** Nova, an original K-pop star character: a singer emoji in a purple spotlight disc with a star clip and sparkles. */
export const NovaAvatar = ({ size = 120, className }: { size?: number; className?: string }) => (
  <span
    aria-hidden
    className={cn('relative inline-flex shrink-0 items-center justify-center rounded-full border-4 border-white shadow-[0_6px_18px_rgba(107,45,92,0.3)]', className)}
    style={{ width: size, height: size, background: 'radial-gradient(circle at 35% 30%, #ffe3f6 0%, #e08cff 55%, #6a2bd1 100%)' }}
  >
    <span className="leading-none" style={{ fontSize: size * 0.58 }}>
      👩‍🎤
    </span>
    <span className="absolute -right-1 top-1 leading-none" style={{ fontSize: size * 0.22 }}>
      ⭐
    </span>
    <span className="absolute -left-1 bottom-2 leading-none" style={{ fontSize: size * 0.18 }}>
      ✨
    </span>
  </span>
);

export interface NovaCelebrationProps {
  childName: string;
  /** What she's celebrating ("Wow, Tara! You've got 20 stickers!"). */
  line: string;
  /** The special sticker, once the gift is opened. */
  reward: { sticker: Sticker; sparkly: boolean } | null;
  onOpen: () => void;
  onClose: () => void;
}

/**
 * Milestone pop-up over a dimmed screen: Nova's avatar breaking out of the top of a cream card, her line in
 * raspberry, then "🎁 Open it". Opening reveals a gold special sticker with a burst and a "Yay!" button.
 */
export function NovaCelebration({ childName, line, reward, onOpen, onClose }: NovaCelebrationProps) {
  const rewardName = reward?.sticker.name;
  useEffect(() => {
    say(`${line} I've got a special sticker for you!`);
  }, [line]);
  useEffect(() => {
    if (rewardName) say(`It's ${withArticle(rewardName)}! Keep going, ${childName}!`);
  }, [rewardName, childName]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Nova" className="fixed inset-0 z-40 flex items-center justify-center bg-grape/40 px-5 backdrop-blur-sm">
      <div className="relative mt-16 w-full max-w-[460px] animate-pop-in rounded-[40px] bg-cream px-7 pb-8 pt-4 text-center candy-petal [--candy:12px]">
        <NovaAvatar size={140} className="-mt-24" />
        <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-bubble">Nova</p>
        <p className="mt-2 text-[clamp(22px,3.4vw,28px)] font-semibold leading-snug text-raspberry">{line}</p>
        {reward ? (
          <>
            <div className="mt-4 flex justify-center">
              <StickerReveal sticker={reward.sticker} shiny={reward.sparkly} />
            </div>
            <Burst key={reward.sticker.id} />
            <Button size="lg" className="mt-5" onClick={onClose}>
              Yay! 💖
            </Button>
          </>
        ) : (
          <>
            <p className="mt-2 text-lg">I’ve got a special sticker for you!</p>
            <Button size="lg" className="mt-5" onClick={onOpen}>
              🎁 Open it
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
