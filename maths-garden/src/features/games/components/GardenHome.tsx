import { possessive } from '@/features/children/model';
import { AppIcon } from '@/shared/brand/AppIcon';
import { Button } from '@/shared/components/ui/button';
import { GAMES, type Game } from '../catalog';
import { levelOf, type Levels } from '../engine';
import { GameTile } from './GameTile';

export interface GardenHomeProps {
  childName: string;
  levels: Levels;
  stickerCount: number;
  onPlay: (game: Game) => void;
  onStickers: () => void;
  onGrownUps: () => void;
}

/** Unicorn tile, "Tara's Maths Garden", the five blob-shaped game tiles with level dots; sticker book (📒 n) top right, faint "Grown-ups" bottom right. */
export const GardenHome = ({ childName, levels, stickerCount, onPlay, onStickers, onGrownUps }: GardenHomeProps) => (
  <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 pb-20 pt-[max(72px,env(safe-area-inset-top))]">
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
    <Button variant="ghost" className="fixed bottom-[max(14px,env(safe-area-inset-bottom))] right-4" onClick={onGrownUps}>
      ⚙️ Grown-ups
    </Button>
  </main>
);
