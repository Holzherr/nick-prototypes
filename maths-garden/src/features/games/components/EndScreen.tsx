import { useEffect } from 'react';
import { withArticle, type PackId, type Sticker } from '@/features/stickers/catalog';
import { PackChooser } from '@/features/stickers/components/PackChooser';
import { StickerReveal } from '@/features/stickers/components/StickerReveal';
import { Button } from '@/shared/components/ui/button';
import { numberWord, say, sounds } from '../sound';
import { Burst } from './Burst';

export interface EndScreenProps {
  childName: string;
  score: number;
  total: number;
  levelUp: boolean;
  /** The sticker picked for this round; null until a pack is chosen. */
  sticker: { sticker: Sticker; shiny: boolean } | null;
  onPickPack: (pack: PackId) => void;
  onAgain: () => void;
  onStickers: () => void;
  onHome: () => void;
}

/**
 * Big star line (⭐ per right answer, ⚪ per miss), "4 out of 5 — Wonderful work!", a yellow "New level
 * unlocked!" pill when earned, then the sticker pack chooser. After the pick: the sticker pops in with a
 * burst, and Play again / My stickers / All games appear.
 */
export function EndScreen({ childName, score, total, levelUp, sticker, onPickPack, onAgain, onStickers, onHome }: EndScreenProps) {
  const message = score === total ? `Perfect, ${childName}! 💖` : score >= 3 ? 'Wonderful work! 🌸' : 'Great trying! 🦋';
  const stickerName = sticker?.sticker.name;

  useEffect(() => {
    sounds.stars();
    say(`You got ${numberWord(score)} star${score === 1 ? '' : 's'}! Now choose a sticker!`);
  }, [score]);

  useEffect(() => {
    if (stickerName) say(`You got ${withArticle(stickerName)} sticker!`);
  }, [stickerName]);

  return (
    <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center gap-[clamp(14px,3vh,26px)] px-6 py-10 text-center">
      <div className="text-[clamp(48px,9vw,96px)] leading-none tracking-[6px]" role="img" aria-label={`${score} stars`}>
        {'⭐'.repeat(score)}
        {'⚪'.repeat(total - score)}
      </div>
      <p className="text-[clamp(24px,4vw,34px)] font-semibold text-raspberry">
        {score} out of {total} — {message}
      </p>
      {levelUp && <p className="rounded-full bg-sunny px-5 py-2 text-xl font-semibold">🌟 New level unlocked!</p>}
      {sticker ? (
        <>
          <StickerReveal sticker={sticker.sticker} shiny={sticker.shiny} />
          <Burst key={sticker.sticker.id} />
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={onAgain}>
              Play again 💗
            </Button>
            <Button variant="quiet" size="lg" onClick={onStickers}>
              My stickers 📒
            </Button>
            <Button variant="quiet" size="lg" onClick={onHome}>
              All games
            </Button>
          </div>
        </>
      ) : (
        <PackChooser onPick={onPickPack} />
      )}
    </main>
  );
}
