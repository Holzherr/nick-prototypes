import { possessive } from '@/features/children/model';
import type { Garden } from '@/features/garden/garden-state';
import { GardenScene } from '@/features/garden/components/GardenScene';
import { AppIcon } from '@/shared/brand/AppIcon';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import { GAMES, type Game } from '../catalog';
import { levelOf, type Levels } from '../engine';
import { GameTile } from './GameTile';

export interface GardenHomeProps {
  childName: string;
  levels: Levels;
  stickerCount: number;
  /** Finished rounds today against the daily goal. */
  today?: { done: number; goal: number };
  /** The garden growing along the bottom of the screen; tapping it opens the full garden. */
  garden?: Garden;
  onPlay: (game: Game) => void;
  onStickers: () => void;
  onGarden?: () => void;
  onGrownUps: () => void;
}

/**
 * Unicorn tile, "Tara's Maths Garden", the five blob-shaped game tiles with level dots; daily goal (🎯 n/3)
 * top left, sticker book (📒 n) top right, the garden growing along the bottom, faint "Grown-ups" bottom right.
 */
export const GardenHome = ({ childName, levels, stickerCount, today, garden, onPlay, onStickers, onGarden, onGrownUps }: GardenHomeProps) => (
  <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 pb-[24vh] pt-[max(72px,env(safe-area-inset-top))]">
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
    <AppIcon size={76} className="mb-3" />
    <h1 className="text-center text-[clamp(34px,6vw,64px)] font-bold leading-tight text-raspberry">{possessive(childName)} Maths Garden</h1>
    <p className="mb-8 mt-1 text-center text-xl font-medium text-grape/75">Tap a game to play! 🌸</p>
    <div className="flex max-w-[860px] flex-wrap justify-center gap-[clamp(16px,3vw,26px)]">
      {GAMES.map((game, i) => (
        <GameTile key={game.id} game={game} level={levelOf(levels, game)} shape={i} onClick={() => onPlay(game)} />
      ))}
    </div>
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
