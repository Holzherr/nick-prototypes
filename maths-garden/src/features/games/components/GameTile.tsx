import { cn } from '@/shared/utils/cn';
import type { Game } from '../catalog';
import { gameName } from '@/features/i18n/content';

const SHAPES = [
  '52% 48% 44% 56% / 58% 44% 56% 42%',
  '44% 56% 58% 42% / 46% 58% 42% 54%',
  '58% 42% 50% 50% / 44% 54% 46% 56%',
  '46% 54% 42% 58% / 56% 44% 58% 42%',
  '54% 46% 56% 44% / 42% 56% 44% 58%',
];

/** The dots go gold once the game is mastered, so the top of a game finally looks different from the rest. */
export const LevelDots = ({ count, level, mastered = false }: { count: number; level: number; mastered?: boolean }) => (
  <span role="img" aria-label={`Level ${level + 1} of ${count}${mastered ? ' — mastered' : ''}`} className="flex items-center gap-[5px]">
    {Array.from({ length: count }, (_, i) => (
      <span key={i} className={cn('size-2.5 rounded-full', i <= level ? (mastered ? 'bg-sunny' : 'bg-bubble') : 'bg-petal')} />
    ))}
    {mastered && <span className="ml-0.5 text-sm leading-none">🏆</span>}
  </span>
);

export interface GameTileProps {
  game: Game;
  level: number;
  /** Top level cleared with a perfect round: gold dots and a trophy. */
  mastered?: boolean;
  /** Which blob outline to use; tiles in a row use 0, 1, 2… so they don't match. */
  shape?: number;
  onClick?: () => void;
}

export const GameTile = ({ game, level, mastered = false, shape = 0, onClick }: GameTileProps) => (
  <button
    type="button"
    onClick={onClick}
    style={{ borderRadius: SHAPES[shape % SHAPES.length] }}
    className="flex h-[clamp(150px,24vw,190px)] w-[clamp(160px,27vw,212px)] flex-col items-center justify-center gap-2 bg-cream text-[clamp(17px,2.6vw,22px)] font-semibold text-grape candy-petal [--candy:10px] transition-transform active:translate-y-1.5 active:scale-[.98] active:[--candy:4px]"
  >
    <span className="text-[clamp(44px,7vw,56px)] leading-none">{game.emoji}</span>
    <span className="px-2 text-center leading-tight">{gameName(game.id)}</span>
    <LevelDots count={game.levels.length} level={level} mastered={mastered} />
  </button>
);
