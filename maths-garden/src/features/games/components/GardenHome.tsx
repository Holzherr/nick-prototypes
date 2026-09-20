import { useState } from 'react';
import { GardenScene } from '@/features/garden/components/GardenScene';
import type { Garden } from '@/features/garden/garden-state';
import { readTheme } from '@/features/personalise/player';
import { ThemeMark } from '@/features/personalise/ThemeMark';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import { GAMES, type Game, type GameId } from '../catalog';
import { levelOf, type Levels } from '../engine';
import type { BreakReason } from '../insights';
import type { Recommendation } from '../recommend';
import { GameTile, LevelDots } from './GameTile';
import { gameName } from '@/features/i18n/content';
import { useT } from '@/features/i18n/i18n';

/**
 * What to say to the child when stopping would be better than another round. One line of six words or fewer:
 * a paragraph is reading for a four-year-old, and the buttons under it say the rest.
 */
export const WIND_DOWN: Record<BreakReason, string> = {
  lots: 'Lots of playing today!',
  struggling: 'Tricky ones! Let’s rest now.',
  quitting: 'Shall we do something else?',
  slowing: 'Big think! Time for a rest.',
};

export interface GardenHomeProps {
  childName: string;
  levels: Levels;
  /** Games whose top level has been cleared outright: gold dots and a trophy on the tile. */
  mastered?: ReadonlySet<GameId>;
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
  /**
   * Why stopping would be better than another round, or null. Home used to look identical at round 21 as at
   * round 1: the end screen flipped its buttons and said "time for a little break", then handed her back to
   * a screen whose loudest element was "play this one". The nudge only works if this screen changes too.
   */
  windDown?: BreakReason | null;
  onPlay: (game: Game) => void;
  onStickers: () => void;
  onGarden?: () => void;
  onGrownUps: () => void;
}

/**
 * The chosen icon's tile, "Tara's Maths Garden", then one big suggested game with the reason under it and the rest
 * behind "Or pick another game". Daily goal (🎯 n/3) top left, sticker book (📒 n) top right, the garden
 * growing along the bottom, faint "Grown-ups" last in the flow.
 *
 * One pink button, whatever the state. A paused round's "Carry on" outranks everything; otherwise the
 * wind-down card's "See my garden" is it. Winding down, the suggested game is folded behind "Or one more if
 * you like": after a round this screen once put three primary actions in front of a four-year-old at once.
 */
export function GardenHome({
  childName,
  levels,
  mastered = new Set<GameId>(),
  stickerCount,
  today,
  garden,
  recommended,
  paused = null,
  onResume,
  onDropPaused,
  windDown = null,
  onPlay,
  onStickers,
  onGarden,
  onGrownUps,
}: GardenHomeProps) {
  const t = useT();
  const [showAll, setShowAll] = useState(!recommended);
  // Winding down, the games stay behind one faint "Or one more if you like" until she asks for them.
  const [oneMore, setOneMore] = useState(false);
  const resting = Boolean(windDown) && !oneMore;
  const others = recommended ? GAMES.filter((game) => game.id !== recommended.game.id) : GAMES;

  // Above everything, including the suggested game: a half-finished round is the one thing on this screen
  // she did not choose to leave behind, so it must not be something to scroll for.
  const pausedCard = paused && onResume && (
    <section className="mb-5 w-full max-w-[440px] rounded-[28px] bg-sunny/30 p-4 text-center">
      <p className="text-[clamp(18px,2.6vw,22px)] font-semibold text-grape">
        {t('garden.wasPlaying', { emoji: paused.game.emoji, game: gameName(paused.game.id) })}
      </p>
      <p className="mt-0.5 text-grape/70">
        {t('garden.carryOnWhere', { answered: paused.answered, total: paused.total })}
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={onResume}>
          {t('garden.carryOn')}
        </Button>
        {onDropPaused && (
          <Button variant="quiet" size="lg" onClick={onDropPaused}>
            {t('garden.startSomethingElse')}
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
          aria-label={t('garden.dailyGoal', { done: Math.min(today.done, today.goal), goal: today.goal })}
        >
          🎯 {today.done >= today.goal ? t('garden.done') : `${today.done}/${today.goal}`}
        </p>
      )}
      <Button
        variant="quiet"
        size="lg"
        className="fixed right-5 top-[max(16px,env(safe-area-inset-top))] z-20 px-6"
        aria-label={t('garden.stickers', { count: stickerCount })}
        onClick={onStickers}
      >
        📒 {stickerCount}
      </Button>

      <ThemeMark theme={readTheme()} size={68} className="mb-2" />
      <h1 className="text-center text-[clamp(30px,5vw,52px)] font-bold leading-tight text-raspberry">{t('garden.title', { name: childName })}</h1>

      {windDown && (
        <section className="mb-4 w-full max-w-[440px] rounded-[28px] bg-leaf/15 p-5 text-center">
          <p className="text-[clamp(20px,3vw,26px)] font-semibold text-leaf-deep">{WIND_DOWN[windDown]}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            {onGarden && (
              // A paused round already has the one pink button on this screen; the garden steps back to cream.
              <Button variant={paused ? 'quiet' : 'primary'} size="lg" onClick={onGarden}>
                {t('garden.seeGarden')}
              </Button>
            )}
            <Button variant="quiet" size="lg" onClick={onStickers}>
              {t('garden.myStickers')}
            </Button>
          </div>
        </section>
      )}

      {resting ? (
        <Button variant="ghost" size="md" className="text-[clamp(17px,2.4vw,21px)] text-grape/70" onClick={() => setOneMore(true)}>
          {t('garden.oneMore')}
        </Button>
      ) : recommended ? (
        <>
          <p className="mb-4 mt-1 text-center text-xl font-medium text-grape/75">{t('garden.playThis')}</p>
          <button
            type="button"
            onClick={() => onPlay(recommended.game)}
            aria-label={`Play ${gameName(recommended.game.id)}. ${recommended.reason}`}
            className="flex w-[clamp(280px,72vw,420px)] animate-pop-in flex-col items-center justify-center gap-2 rounded-[64px] bg-cream px-6 py-[clamp(22px,4vh,38px)] candy-bubble [--candy:12px] transition-transform active:translate-y-2 active:scale-[.98] active:[--candy:4px]"
          >
            <span className="text-[clamp(64px,13vw,104px)] leading-none">{recommended.game.emoji}</span>
            <span className="text-center text-[clamp(24px,4vw,34px)] font-bold leading-tight text-raspberry">{gameName(recommended.game.id)}</span>
            <span className="rounded-full bg-petal/70 px-4 py-1 text-center text-[clamp(15px,2.2vw,19px)] font-semibold text-grape">{recommended.reason}</span>
            <LevelDots count={recommended.game.levels.length} level={levelOf(levels, recommended.game)} mastered={mastered.has(recommended.game.id)} />
          </button>

          <Button variant="ghost" size="md" className="mt-4 text-[clamp(17px,2.4vw,21px)] text-grape/70" onClick={() => setShowAll((open) => !open)}>
            {showAll ? t('garden.hideOthers') : t('garden.pickAnother')}
          </Button>
        </>
      ) : (
        <p className="mb-8 mt-1 text-center text-xl font-medium text-grape/75">Tap a game to play! 🌸</p>
      )}

      {showAll && !resting && (
        <div className={cn('flex max-w-[860px] flex-wrap justify-center gap-[clamp(12px,2.4vw,22px)]', recommended && 'mt-3 animate-pop-in')}>
          {others.map((game, i) => (
            <GameTile key={game.id} game={game} level={levelOf(levels, game)} mastered={mastered.has(game.id)} shape={i} onClick={() => onPlay(game)} />
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
      {/* In the flow, not fixed: pinned bottom-right it sat over the suggested game's title on a phone. */}
      <Button variant="ghost" className="mt-8" onClick={onGrownUps}>
        ⚙️ {t('garden.grownUps')}
      </Button>
    </main>
  );
}
