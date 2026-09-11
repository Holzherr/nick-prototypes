import { useEffect } from 'react';
import { withArticle, type PackId, type Sticker } from '@/features/stickers/catalog';
import { PackChooser } from '@/features/stickers/components/PackChooser';
import { StickerReveal } from '@/features/stickers/components/StickerReveal';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import type { BreakReason } from '../insights';
import { numberWord, say, sounds } from '../sound';
import { Burst } from './Burst';

export interface EndScreenProps {
  childName: string;
  score: number;
  total: number;
  levelUp: boolean;
  /** Fastest 80%+ round yet at this game and level. */
  personalBest?: boolean;
  /** Finished rounds today against the daily goal; `justReached` when this round hit it. */
  goal?: { done: number; goal: number; justReached: boolean };
  /** Set when a break would help; the screen then leads with All games instead of Play again. */
  breakHint?: BreakReason | null;
  /** The sticker picked for this round; null until a pack is chosen. */
  sticker: { sticker: Sticker; shiny: boolean } | null;
  onPickPack: (pack: PackId) => void;
  onAgain: () => void;
  onStickers: () => void;
  onHome: () => void;
}

/**
 * Big star line (⭐ per right answer, ⚪ per miss), "4 out of 5 — Wonderful work!", pills for a new level,
 * a fastest-ever round and the daily goal, then the sticker pack chooser. After the pick: the sticker pops in
 * with a burst, and Play again / My stickers / All games appear (with a gentle break message when it's time).
 */
export function EndScreen({ childName, score, total, levelUp, personalBest = false, goal, breakHint = null, sticker, onPickPack, onAgain, onStickers, onHome }: EndScreenProps) {
  const message = score === total ? `Perfect, ${childName}! 💖` : score >= 3 ? 'Wonderful work! 🌸' : 'Great trying! 🦋';
  const stickerName = sticker?.sticker.name;

  useEffect(() => {
    sounds.stars();
    const extras = [personalBest ? 'That was your fastest ever!' : '', goal?.justReached ? 'You did your daily goal!' : ''].filter(Boolean).join(' ');
    say(`You got ${numberWord(score)} star${score === 1 ? '' : 's'}! ${extras} Now choose a sticker!`);
  }, [score, personalBest, goal?.justReached]);

  useEffect(() => {
    if (stickerName) say(`You got ${withArticle(stickerName)} sticker!${breakHint ? ' Time for a little break!' : ''}`);
  }, [stickerName, breakHint]);

  return (
    <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center gap-[clamp(14px,3vh,26px)] px-6 py-10 text-center">
      <div className="text-[clamp(48px,9vw,96px)] leading-none tracking-[6px]" role="img" aria-label={`${score} stars`}>
        {'⭐'.repeat(score)}
        {'⚪'.repeat(total - score)}
      </div>
      <p className="text-[clamp(24px,4vw,34px)] font-semibold text-raspberry">
        {score} out of {total} — {message}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {levelUp && <p className="rounded-full bg-sunny px-5 py-2 text-xl font-semibold">🌟 New level unlocked!</p>}
        {personalBest && <p className="rounded-full bg-cream px-5 py-2 text-xl font-semibold candy-petal [--candy:4px]">⚡ Fastest ever!</p>}
        {goal &&
          (goal.justReached ? (
            <p className="rounded-full bg-leaf px-5 py-2 text-xl font-semibold text-white">🎯 Daily goal done! Sparkly sticker ✨</p>
          ) : (
            goal.done < goal.goal && (
              <p className="rounded-full bg-cream px-5 py-2 text-lg font-medium candy-petal [--candy:4px]">
                🎯 {goal.done} of {goal.goal} today
              </p>
            )
          ))}
      </div>
      {sticker ? (
        <>
          <StickerReveal sticker={sticker.sticker} shiny={sticker.shiny} />
          <Burst key={sticker.sticker.id} />
          {breakHint && <p className="text-[clamp(20px,3vw,26px)] font-semibold">🌈 Brilliant playing! Time for a little break?</p>}
          <div className={cn('flex flex-wrap justify-center gap-4', breakHint && 'flex-row-reverse')}>
            <Button size="lg" variant={breakHint ? 'quiet' : 'primary'} onClick={onAgain}>
              Play again 💗
            </Button>
            <Button variant="quiet" size="lg" onClick={onStickers}>
              My stickers 📒
            </Button>
            <Button variant={breakHint ? 'primary' : 'quiet'} size="lg" onClick={onHome}>
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
