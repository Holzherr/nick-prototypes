import { useState } from 'react';
import { possessive } from '@/features/children/model';
import { GardenScene } from '@/features/garden/components/GardenScene';
import type { Garden } from '@/features/garden/garden-state';
import { AppIcon } from '@/shared/brand/AppIcon';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import { GAMES, type Game } from '../catalog';
import { levelOf, type Levels } from '../engine';
import type { Recommendation } from '../recommend';
import { GameTile, LevelDots } from './GameTile';

export interface GardenHomeProps {
  childName: string;
  levels: Levels;
  stickerCount: number;
  /** Finished rounds today against the daily goal. */
  today?: { done: number; goal: number };
  /** The garden growing along the bottom of the screen; tapping it opens the full garden. */
  garden?: Garden;
  /** The game to lead with; without it every tile is shown at once. */
  recommended?: Recommendation;
  /** A round she left part-way through, offered above everything else so it is never lost by accident. */
  paused?: { game: Game; answered: number; total: number } | null;
  onResume?: () => void;
  onDropPaused?: () => void;
  onPlay: (game: Game) => void;
  onStickers: () => void;
  onGarden?: () => void;
  onGrownUps: () => void;
}

/**
 * Unicorn tile, "Tara's Maths Garden", then one big suggested game with the reason under it and the rest
 * behind "Or pick another game". Daily goal (🎯 n/3) top left, sticker book (📒 n) top right, the garden
 * growing along the bottom, faint "Grown-ups" bottom right.
 */
export function GardenHome({
  childName,
  levels,
  stickerCount,
  today,
  garden,
  recommended,
  paused = null,
  onResume,
  onDropPaused,
  onPlay,
  onStickers,
  onGarden,
  onGrownUps,
}: GardenHomeProps) {
  const [showAll, setShowAll] = useState(!recommended);
  const others = recommended ? GAMES.filter((game) => game.id !== recommended.game.id) : GAMES;

  // Above everything, including the suggested game: a half-finished round is the one thing on this screen
  // she did not choose to leave behind, so it must not be something to scroll for.
  const pausedCard = paused && onResume && (
    <section className="mb-5 w-full max-w-[440px] rounded-[28px] bg-sunny/30 p-4 text-center">
      <p className="text-[clamp(18px,2.6vw,22px)] font-semibold text-grape">
        {paused.game.emoji} You were playing {paused.game.name}
      </p>
      <p className="mt-0.5 text-grape/70">
        {paused.answered} of {paused.total} done — carry on where you stopped?
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={onResume}>
          Carry on 💗
        </Button>
        {onDropPaused && (
          <Button variant="quiet" size="lg" onClick={onDropPaused}>
            Start something else
          </Button>
        )}
      </div>
    </section>
  );

  return (
    <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 pb-[24vh] pt-[max(72px,env(safe-area-inset-top))]">
      {pausedCard}
      {today && (
        <p
          className={cn(
            'fixed left-5 top-[max(16px,env(safe-area-inset-top))] z-20 flex min-h-[68px] items-center rounded-full px-6 text-[clamp(20px,2.6vw,26px)] font-semibold',
            today.done >= today.goal ? 'bg-leaf text-white' : 'bg-cream candy-petal [--candy:8px]',
          )}
          aria-label={`Daily goal: ${Math.min(today.done, today.goal)} of ${today.goal} rounds`}
        >
          🎯 {today.done >= today.goal ? 'Done!' : `${today.done}/${today.goal}`}
        </p>
      )}
      <Button
        variant="quiet"
        size="lg"
        className="fixed right-5 top-[max(16px,env(safe-area-inset-top))] z-20 px-6"
        aria-label={`My stickers: ${stickerCount}`}
        onClick={onStickers}
      >
        📒 {stickerCount}
      </Button>

      <AppIcon size={68} className="mb-2" />
      <h1 className="text-center text-[clamp(30px,5vw,52px)] font-bold leading-tight text-raspberry">{possessive(childName)} Maths Garden</h1>

      {recommended ? (
        <>
          <p className="mb-4 mt-1 text-center text-xl font-medium text-grape/75">Let’s play this one! 🌸</p>
          <button
            type="button"
            onClick={() => onPlay(recommended.game)}
            aria-label={`Play ${recommended.game.name}. ${recommended.reason}`}
            className="flex w-[clamp(280px,72vw,420px)] animate-pop-in flex-col items-center justify-center gap-2 rounded-[64px] bg-cream px-6 py-[clamp(22px,4vh,38px)] candy-bubble [--candy:12px] transition-transform active:translate-y-2 active:scale-[.98] active:[--candy:4px]"
          >
            <span className="text-[clamp(64px,13vw,104px)] leading-none">{recommended.game.emoji}</span>
            <span className="text-center text-[clamp(24px,4vw,34px)] font-bold leading-tight text-raspberry">{recommended.game.name}</span>
            <span className="rounded-full bg-petal/70 px-4 py-1 text-center text-[clamp(15px,2.2vw,19px)] font-semibold text-grape">{recommended.reason}</span>
            <LevelDots count={recommended.game.levels.length} level={levelOf(levels, recommended.game)} />
          </button>

          <Button variant="ghost" size="md" className="mt-4 text-[clamp(17px,2.4vw,21px)] text-grape/70" onClick={() => setShowAll((open) => !open)}>
            {showAll ? 'Hide the other games' : 'Or pick another game →'}
          </Button>
        </>
      ) : (
        <p className="mb-8 mt-1 text-center text-xl font-medium text-grape/75">Tap a game to play! 🌸</p>
      )}

      {showAll && (
        <div className={cn('flex max-w-[860px] flex-wrap justify-center gap-[clamp(12px,2.4vw,22px)]', recommended && 'mt-3 animate-pop-in')}>
          {others.map((game, i) => (
            <GameTile key={game.id} game={game} level={levelOf(levels, game)} shape={i} onClick={() => onPlay(game)} />
          ))}
        </div>
      )}

      {garden && (
        <button
          type="button"
          onClick={onGarden}
          aria-label={`My garden: ${garden.plants.length} flowers`}
          className="fixed inset-x-0 bottom-0 -z-10 w-full cursor-pointer print:hidden"
        >
          <GardenScene garden={garden} variant="strip" />
        </button>
      )}
      <Button variant="ghost" className="fixed bottom-[max(14px,env(safe-area-inset-bottom))] right-4" onClick={onGrownUps}>
        ⚙️ Grown-ups
      </Button>
    </main>
  );
}
