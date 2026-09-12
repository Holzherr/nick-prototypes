import { useEffect, useRef, useState } from 'react';
import type { Child } from '@/features/children/model';
import { skillForGame, type StageNumber } from '@/features/curriculum/skills';
import { GAMES, gameById, type Game, type GameId } from '@/features/games/catalog';
import { EndScreen } from '@/features/games/components/EndScreen';
import { GameScreen } from '@/features/games/components/GameScreen';
import { GardenHome } from '@/features/games/components/GardenHome';
import { GrownUpsGate } from '@/features/games/components/GrownUpsGate';
import { levelOf, nextLevel, type AnswerRecord, type RoundRecord } from '@/features/games/engine';
import { breakSuggestion, isPersonalBest, todaySummary, type BreakReason } from '@/features/games/insights';
import { recommendGame } from '@/features/games/recommend';
import { setNameSound, unlockAudio } from '@/features/games/sound';
import type { CheckinScores } from '@/features/progress/components/CheckInPanel';
import { DashboardScreen } from '@/features/progress/components/DashboardScreen';
import { nameSoundKey } from '@/features/progress/components/VoicePanel';
import { guestProfiles, importChanges, markImported, type GuestProfile } from '@/features/progress/guest';
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
  | { name: 'report' }
  | { name: 'history' }
  | { name: 'stickers' }
  | { name: 'gate' }
  | { name: 'dashboard' };

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
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [celebration, setCelebration] = useState<{ line: string; reward: { sticker: Sticker; sparkly: boolean } } | null>(null);
  const [novaDone, setNovaDone] = useState(false);
  const [guests, setGuests] = useState<GuestProfile[]>(() => (allowGuestImport ? guestProfiles() : []));
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

  const home = () => setScreen({ name: 'home' });

  const play = (game: Game) => {
    unlockAudio();
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

  /** Left mid-round: keep what was answered (it shows frustration patterns), but it never changes the level. */
  const quit = (game: Game, level: number, answers: AnswerRecord[]) => {
    if (answers.length) apply({ kind: 'round', round: makeRound(game, level, answers, false) });
    home();
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

  /** Copy a guest profile's play onto this child. Every record keeps its id, so a repeat is a no-op. */
  const importGuest = (profile: GuestProfile) => {
    setImporting({ busy: true, done: null });
    for (const change of importChanges(profile.progress, latest.current, child.id)) apply(change);
    markImported(profile.child.id);
    setGuests(guestProfiles());
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
            onPlay={play}
            onStickers={() => setScreen({ name: 'stickers' })}
            onGarden={() => setScreen({ name: 'garden' })}
            onGrownUps={() => setScreen({ name: 'gate' })}
          />
        );
      case 'game':
        return (
          <GameScreen
            key={screen.run}
            game={screen.game}
            level={screen.level}
            childName={child.name}
            onFinish={(answers) => finish(screen.game, screen.level, answers)}
            onHome={(answers) => quit(screen.game, screen.level, answers)}
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
            guest={
              allowGuestImport && (guests.length > 0 || importing.done)
                ? { profiles: guests, busy: importing.busy, imported: importing.done, onImport: importGuest, onDismiss: () => setGuests([]) }
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
