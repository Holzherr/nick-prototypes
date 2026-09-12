import { useEffect, useRef, useState } from 'react';
import type { Child } from '@/features/children/model';
import { skillForGame, type StageNumber } from '@/features/curriculum/skills';
import { GAMES, gameById, type Game, type GameId } from '@/features/games/catalog';
import { EndScreen } from '@/features/games/components/EndScreen';
import { GameScreen, type PausedRound } from '@/features/games/components/GameScreen';
import { GardenHome } from '@/features/games/components/GardenHome';
import { GrownUpsGate, grownUpsPassed } from '@/features/games/components/GrownUpsGate';
import { levelOf, nextLevel, type AnswerRecord, type RoundRecord } from '@/features/games/engine';
import { breakSuggestion, isPersonalBest, todaySummary, type BreakReason } from '@/features/games/insights';
import { recommendGame } from '@/features/games/recommend';
import { setNameSound, unlockAudio } from '@/features/games/sound';
import type { CheckinScores } from '@/features/progress/components/CheckInPanel';
import { DashboardScreen } from '@/features/progress/components/DashboardScreen';
import { nameSoundKey } from '@/features/progress/components/VoicePanel';
import { guestProfilesToImport, importChanges, type GuestProfile } from '@/features/progress/guest';
import { applyChange, levelChange, type Change, type StickerRecord } from '@/features/progress/model';
import { ProgressScreen } from '@/features/progress/components/ProgressScreen';
import { PROBES } from '@/features/progress/probes';
import type { ProgressRepo } from '@/features/progress/repo';
import { buildReport, stageOf } from '@/features/report/report';
import { ReportScreen } from '@/features/report/ReportScreen';
import { alreadySent, markSent, sendReport } from '@/features/report/send-report';
import { appUrl } from '@/features/resources/qr';
import { drawReward, stickerById, type PackId, type Sticker } from '@/features/stickers/catalog';
import { NovaCelebration } from '@/features/stickers/components/NovaCelebration';
import { StickerBookScreen } from '@/features/stickers/components/StickerBookScreen';
import { drawSpecial, pendingMilestone } from '@/features/stickers/milestones';
import { readJSON } from '@/shared/utils/storage';
import { ImportPromptScreen } from '@/features/progress/components/ImportPromptScreen';
import { GardenScreen } from './components/GardenScreen';
import { gardenNews, gardenOf, type Garden } from './garden-state';

type Screen =
  | { name: 'home' }
  | { name: 'game'; game: Game; level: number; run: number }
  | {
      name: 'end';
      game: Game;
      roundId: string;
      score: number;
      total: number;
      levelUp: boolean;
      personalBest: boolean;
      goal: { done: number; goal: number; justReached: boolean };
      breakHint: BreakReason | null;
      sticker: StickerRecord | null;
      /** The garden as it was before this round, to say what grew. */
      gardenBefore: Garden;
    }
  | { name: 'garden' }
  | { name: 'import' }
  | { name: 'report' }
  | { name: 'history' }
  | { name: 'stickers' }
  | { name: 'gate' }
  | { name: 'dashboard' };

/** The one in-app screen with a hash of its own, so a grown-up can reload it (and link straight to it). */
export const GROWN_UPS_PATH = '/grown-ups';

/** Swap the hash without a navigation, so back still leaves the app rather than walking these screens. */
const setHash = (path: string) => window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${path}`);

export interface GardenAppProps {
  child: Child;
  repo: ProgressRepo;
  /** Signed in: offer to copy guest-mode play on this device onto the child's account. */
  allowGuestImport?: boolean;
  /** No account at all: the grown-ups screen offers signing in, not signing out. */
  guestMode?: boolean;
  /** Opened from a QR code on a printable: start this game as soon as the child's garden opens. */
  startGame?: GameId;
  /** The signed-in parent's address; tutor reports are emailed there. */
  parentEmail?: string;
  onSwitchChild: () => void;
  onSignOut: () => void;
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * One child's garden: home → game → end (pick a sticker) → …, plus the sticker book and the gated grown-ups
 * screen. Nova pops up over home or the end screen when a milestone is owed a special sticker, at most once
 * between games.
 */
export function GardenApp({ child, repo, allowGuestImport = false, guestMode = false, startGame, parentEmail, onSwitchChild, onSignOut }: GardenAppProps) {
  const [progress, setProgress] = useState(() => repo.cached(child.id));
  const [pending, setPending] = useState(() => repo.pending());
  // Guest play belongs to a different child id, so once you sign in it vanishes from view. Offering it
  // here — before the garden, not behind the grown-ups sum — is the difference between "moved across" and
  // "the app lost it". Whether there is anything to offer is decided by comparing records, never by a flag.
  // The grown-ups screen is the one screen worth surviving a reload: a parent reading it and pulling to
  // refresh used to land back in the child's garden and have to answer the sum again. It is the only screen
  // in the hash, because the rest are steps in a child's play — a refresh mid-round should not resume it.
  const [screen, setScreen] = useState<Screen>(() => {
    if (allowGuestImport && guestProfilesToImport(repo.cached(child.id), child.id).length > 0) return { name: 'import' };
    if (window.location.hash.replace(/^#/, '').split('?')[0] === GROWN_UPS_PATH) return grownUpsPassed() ? { name: 'dashboard' } : { name: 'gate' };
    return { name: 'home' };
  });
  const [celebration, setCelebration] = useState<{ line: string; reward: { sticker: Sticker; sparkly: boolean } } | null>(null);
  const [novaDone, setNovaDone] = useState(false);
  // A round left part-way through. Held here rather than in GameScreen, which dies the moment she leaves.
  const [paused, setPaused] = useState<({ game: Game; level: number } & PausedRound) | null>(null);
  const [guestsDismissed, setGuestsDismissed] = useState(false);
  const [importing, setImporting] = useState<{ busy: boolean; done: { name: string; rounds: number; stickers: number } | null }>({ busy: false, done: null });
  const [emailing, setEmailing] = useState<{ busy: boolean; sent: boolean; error: string | null }>({ busy: false, sent: false, error: null });
  const latest = useRef(progress);
  const runs = useRef(0);

  useEffect(() => {
    latest.current = progress;
  }, [progress]);

  useEffect(() => {
    setNameSound(child.name, readJSON<string | null>(nameSoundKey(child.id), null));
  }, [child.id, child.name]);

  // Scanned a sheet's QR code: open that game once, then drop the deep link so a refresh lands at home.
  useEffect(() => {
    if (!startGame) return;
    play(gameById(startGame));
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startGame]);

  useEffect(() => {
    let live = true;
    void repo.load(child.id).then((loaded) => {
      if (!live) return;
      setProgress(loaded);
      setPending(repo.pending());
    });
    return () => {
      live = false;
    };
  }, [repo, child.id]);

  const apply = (change: Change) => {
    latest.current = applyChange(latest.current, change);
    setProgress(latest.current);
    setPending(repo.pending() + 1);
    void repo.apply(change).finally(() => setPending(repo.pending()));
  };

  const home = () => {
    setHash('/app');
    setScreen({ name: 'home' });
  };

  const grownUps = () => {
    setHash(GROWN_UPS_PATH);
    setScreen(grownUpsPassed() ? { name: 'dashboard' } : { name: 'gate' });
  };

  const play = (game: Game) => {
    unlockAudio();
    // Starting something else is the moment the paused round is really given up: record what was answered.
    if (paused && paused.game.id !== game.id) dropPaused();
    runs.current += 1;
    setNovaDone(false);
    setScreen({ name: 'game', game, level: levelOf(latest.current.levels, game), run: runs.current });
  };

  const makeRound = (game: Game, level: number, answers: AnswerRecord[], completed: boolean): RoundRecord => ({
    id: crypto.randomUUID(),
    childId: child.id,
    game: game.id,
    level,
    score: answers.filter((a) => a.correct).length,
    total: answers.length,
    answers,
    playedAt: new Date().toISOString(),
    ...(completed ? {} : { completed: false }),
    levelMax: game.levels[level]?.max,
  });

  const finish = (game: Game, level: number, answers: AnswerRecord[]) => {
    const gardenBefore = gardenOf(latest.current);
    const round = makeRound(game, level, answers, true);
    const all = [...latest.current.rounds, round];
    const next = nextLevel(all, game, level);
    apply({ kind: 'round', round });
    if (next !== level) {
      apply(levelChange(child.id, game.id, level, next, next > level ? 'earned' : 'dropped'));
      if (stageOf(next) > stageOf(level)) void emailStageUp(game, stageOf(next));
    }
    const day = todaySummary(all);
    setScreen({
      name: 'end',
      game,
      roundId: round.id,
      score: round.score,
      total: round.total,
      levelUp: next > level,
      personalBest: isPersonalBest(all, round),
      goal: { done: day.done, goal: day.goal, justReached: day.done === day.goal },
      breakHint: breakSuggestion(all),
      sticker: null,
      gardenBefore,
    });
  };

  /**
   * Left mid-round. The 🏠 button sits at a child's fingertip and fires on one tap, so this used to bin a
   * half-finished round with no way back. Leaving now pauses: nothing is written, home offers to carry on,
   * and the round is only recorded as abandoned once she actually starts something else — which keeps the
   * frustration signal without a stray tap costing her the round.
   */
  const quit = (game: Game, level: number, round: PausedRound) => {
    setPaused({ game, level, ...round });
    home();
  };

  /** Give up on the paused round for real: record what was answered, so quitting still shows in the log. */
  const dropPaused = () => {
    if (paused && paused.answers.length) apply({ kind: 'round', round: makeRound(paused.game, paused.level, paused.answers, false) });
    setPaused(null);
  };

  const resumePaused = () => {
    if (!paused) return;
    unlockAudio();
    runs.current += 1;
    setNovaDone(false);
    setScreen({ name: 'game', game: paused.game, level: paused.level, run: runs.current });
  };

  const addSticker = (sticker: Sticker, shiny: boolean, roundId: string | null): StickerRecord => {
    const record: StickerRecord = { id: crypto.randomUUID(), childId: child.id, sticker: sticker.id, shiny, roundId, earnedAt: new Date().toISOString() };
    apply({ kind: 'sticker', sticker: record });
    return record;
  };

  const pickSticker = (pack: PackId) => {
    if (screen.name !== 'end' || screen.sticker) return;
    const reward = drawReward(pack, latest.current.stickers);
    const sticker = addSticker(reward.sticker, reward.sparkly || screen.score === screen.total || screen.goal.justReached, screen.roundId);
    setScreen({ ...screen, sticker });
  };

  /**
   * A game crossing into a new printable stage is the moment a parent wants to hear about: it emails the
   * tutor report with the sheets for the new stage. Once per child, game and stage, on this device.
   */
  const emailStageUp = async (game: Game, stage: StageNumber) => {
    const key = `${child.id}:${game.id}:${stage}`;
    if (!parentEmail || alreadySent(key)) return;
    markSent(key);
    const result = await sendReport(buildReport(child.name, latest.current), {
      appUrl: appUrl(''),
      stageUp: { skillName: skillForGame(game.id)?.name ?? game.skill, stage },
    });
    if (!result.ok) console.warn('maths-garden: could not email the stage-up report', result.error);
  };

  const emailReport = async () => {
    setEmailing({ busy: true, sent: false, error: null });
    const result = await sendReport(buildReport(child.name, latest.current), { appUrl: appUrl('') });
    setEmailing({ busy: false, sent: result.ok, error: result.ok ? null : (result.error ?? 'Could not send it. Try again later.') });
  };

  /**
   * Copy a guest profile's play onto this child. Every record keeps its id, so a repeat is a no-op — and
   * the offer disappears on its own once the records are here, rather than because a flag was ticked.
   */
  const importGuest = (profile: GuestProfile) => {
    setImporting({ busy: true, done: null });
    const changes = importChanges(profile.progress, latest.current, child.id);
    for (const change of changes) apply(change);
    setImporting({ busy: false, done: { name: profile.child.name, rounds: profile.rounds, stickers: profile.stickers } });
  };

  const addCheckin = (scores: CheckinScores, note: string) => {
    const takenOn = today();
    for (const probe of PROBES) {
      const score = scores[probe.id];
      if (score === undefined || Number.isNaN(score)) continue;
      apply({ kind: 'checkin', checkin: { id: crypto.randomUUID(), childId: child.id, probe: probe.id, score, max: probe.max, note: note || null, takenOn } });
    }
  };

  const garden = gardenOf(progress);
  // Recomputed from what this child actually has, so it empties itself as the imported records land.
  const guests = allowGuestImport && !guestsDismissed ? guestProfilesToImport(progress, child.id) : [];
  const owed = pendingMilestone(progress.stickers, progress.levels, GAMES);
  const novaMoment = screen.name === 'home' || (screen.name === 'end' && screen.sticker !== null);
  const nova =
    celebration || (owed && novaMoment && !novaDone) ? (
      <NovaCelebration
        childName={child.name}
        line={celebration?.line ?? owed?.line(child.name) ?? ''}
        reward={celebration?.reward ?? null}
        onOpen={() => {
          if (!owed) return;
          const reward = drawSpecial(latest.current.stickers);
          addSticker(reward.sticker, reward.sparkly, null);
          setCelebration({ line: owed.line(child.name), reward });
        }}
        onClose={() => {
          setCelebration(null);
          setNovaDone(true);
        }}
      />
    ) : null;

  const view = (() => {
    switch (screen.name) {
      case 'home':
        return (
          <GardenHome
            childName={child.name}
            levels={progress.levels}
            stickerCount={progress.stickers.length}
            today={todaySummary(progress.rounds)}
            garden={garden}
            recommended={recommendGame(progress.rounds, progress.levels, GAMES)}
            paused={paused ? { game: paused.game, answered: paused.answers.length, total: paused.questions.length } : null}
            onResume={resumePaused}
            onDropPaused={dropPaused}
            onPlay={play}
            onStickers={() => setScreen({ name: 'stickers' })}
            onGarden={() => setScreen({ name: 'garden' })}
            onGrownUps={grownUps}
          />
        );
      case 'game':
        return (
          <GameScreen
            key={screen.run}
            game={screen.game}
            level={screen.level}
            childName={child.name}
            resume={paused && paused.game.id === screen.game.id ? { questions: paused.questions, index: paused.index, answers: paused.answers } : undefined}
            onFinish={(answers) => {
              setPaused(null);
              finish(screen.game, screen.level, answers);
            }}
            onHome={(round) => quit(screen.game, screen.level, round)}
          />
        );
      case 'end': {
        const drawn = screen.sticker ? stickerById(screen.sticker.sticker) : undefined;
        return (
          <EndScreen
            childName={child.name}
            score={screen.score}
            total={screen.total}
            levelUp={screen.levelUp}
            personalBest={screen.personalBest}
            goal={screen.goal}
            breakHint={screen.breakHint}
            sticker={drawn && screen.sticker ? { sticker: drawn, shiny: screen.sticker.shiny } : null}
            gardenNews={gardenNews(screen.gardenBefore, garden)}
            onPickPack={pickSticker}
            onAgain={() => play(screen.game)}
            onStickers={() => setScreen({ name: 'stickers' })}
            onGarden={() => setScreen({ name: 'garden' })}
            onHome={home}
          />
        );
      }
      case 'garden':
        return <GardenScreen childName={child.name} garden={garden} onHome={home} />;
      case 'import':
        return (
          <ImportPromptScreen
            childName={child.name}
            childAvatar={child.avatar}
            profiles={guests}
            busy={importing.busy}
            imported={importing.done}
            onImport={importGuest}
            onSkip={home}
            onDone={home}
          />
        );
      case 'report':
        return (
          <ReportScreen
            report={buildReport(child.name, progress)}
            email={parentEmail ? { address: parentEmail, ...emailing, onSend: () => void emailReport() } : undefined}
            onClose={() => setScreen({ name: 'dashboard' })}
          />
        );
      case 'history':
        return <ProgressScreen child={child} progress={progress} onClose={() => setScreen({ name: 'dashboard' })} />;
      case 'stickers':
        return <StickerBookScreen childName={child.name} stickers={progress.stickers} onHome={home} />;
      case 'gate':
        return <GrownUpsGate onPass={() => setScreen({ name: 'dashboard' })} onCancel={home} />;
      case 'dashboard':
        return (
          <DashboardScreen
            child={child}
            progress={progress}
            pending={pending}
            guestMode={guestMode}
            parentEmail={parentEmail}
            guest={
              allowGuestImport && (guests.length > 0 || importing.done)
                ? { profiles: guests, busy: importing.busy, imported: importing.done, onImport: importGuest, onDismiss: () => setGuestsDismissed(true) }
                : undefined
            }
            onSetLevel={(game, level) => apply(levelChange(child.id, game, levelOf(latest.current.levels, gameById(game)), level, 'manual'))}
            onReport={() => setScreen({ name: 'report' })}
            onHistory={() => setScreen({ name: 'history' })}
            onAddCheckin={addCheckin}
            onSwitchChild={onSwitchChild}
            onSignOut={onSignOut}
            onClose={home}
          />
        );
    }
  })();

  return (
    <>
      {view}
      {nova}
    </>
  );
}
