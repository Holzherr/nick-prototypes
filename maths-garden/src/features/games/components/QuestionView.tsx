import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/shared/components/ui/button';
import type { Choice, Question, Side } from '../questions';
import { numberWord, say, sounds } from '../sound';
import { AnswerRow } from './AnswerRow';
import { CompareSides } from './CompareSides';
import { DotCard } from './DotCard';
import { FrameCard } from './FrameCard';
import { ObjectCard } from './ObjectCard';

type Q<G extends Question['game']> = Extract<Question, { game: G }>;

export interface QuestionViewProps {
  question: Question;
  /** What was tapped; null while waiting for an answer. */
  chosen: Choice | null;
  onAnswer: (choice: Choice) => void;
  /** How long Quick Peek shows the dots. */
  peekMs?: number;
  /** Gap between unicorns arriving in One More Unicorn. */
  stepMs?: number;
  /** The answer buttons have just appeared (Quick Peek, One More Unicorn). */
  onReady?: () => void;
  /** An object was tapped in Count With Me; `fresh` is false for a repeat tap. */
  onTap?: (fresh: boolean) => void;
  /** "Hear it again" was pressed in Find the Number. */
  onReplay?: () => void;
}

/** The latest value of a callback, for timers that must not restart when the parent re-renders. */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

const Stage = ({ prompt, children }: { prompt: ReactNode; children: ReactNode }) => (
  <div className="flex w-full max-w-[900px] flex-col items-center justify-center gap-[clamp(18px,4vh,34px)]">
    <p className="min-h-[1.4em] text-center text-[clamp(22px,3.6vw,36px)] font-semibold">{prompt}</p>
    {children}
  </div>
);

/** Holds the space the answer buttons will take, so nothing jumps when they appear. */
const AnswerSpace = () => <div aria-hidden className="h-[clamp(93px,calc(14vw+9px),127px)]" />;

const asNumber = (c: Choice | null) => (typeof c === 'number' ? c : null);
const asSide = (c: Choice | null): Side | null => (c === 'left' || c === 'right' ? c : null);

/** One question of any game: the prompt, the picture and the answer buttons, with its own speech and timing. */
export function QuestionView({ question, chosen, onAnswer, peekMs = 2000, stepMs = 900, onReady, onTap, onReplay }: QuestionViewProps) {
  switch (question.game) {
    case 'peek':
      return <Peek q={question} chosen={asNumber(chosen)} onAnswer={onAnswer} peekMs={question.peekMs ?? peekMs} onReady={onReady} />;
    case 'count':
      return <Count q={question} chosen={asNumber(chosen)} onAnswer={onAnswer} onTap={onTap} />;
    case 'find':
      return <Find q={question} chosen={asNumber(chosen)} onAnswer={onAnswer} onReplay={onReplay} />;
    case 'more':
      return <More q={question} chosen={asSide(chosen)} onAnswer={onAnswer} />;
    case 'add':
      return <Add q={question} chosen={asNumber(chosen)} onAnswer={onAnswer} stepMs={stepMs} onReady={onReady} />;
    case 'bond':
      return <Bond q={question} chosen={asNumber(chosen)} onAnswer={onAnswer} />;
    case 'fewer':
      return <Fewer q={question} chosen={asNumber(chosen)} onAnswer={onAnswer} stepMs={stepMs} onReady={onReady} />;
    case 'teen':
      return <Teen q={question} chosen={asNumber(chosen)} onAnswer={onAnswer} />;
  }
}

function Peek({ q, chosen, onAnswer, peekMs, onReady }: { q: Q<'peek'>; chosen: number | null; onAnswer: (n: number) => void; peekMs: number; onReady?: () => void }) {
  const [hidden, setHidden] = useState(false);
  const ready = useLatest(onReady);
  useEffect(() => {
    say('How many dots? Look quickly!');
    const t = window.setTimeout(() => {
      setHidden(true);
      ready.current?.();
    }, peekMs);
    return () => window.clearTimeout(t);
  }, [peekMs, ready]);
  return (
    <Stage prompt="How many dots? Look quickly! 👀">
      <DotCard count={q.answer} arrangement={q.arrangement} seed={q.seed} hidden={hidden && chosen === null} />
      {hidden ? <AnswerRow options={q.options} answer={q.answer} chosen={chosen} onPick={onAnswer} /> : <AnswerSpace />}
    </Stage>
  );
}

function Count({ q, chosen, onAnswer, onTap }: { q: Q<'count'>; chosen: number | null; onAnswer: (n: number) => void; onTap?: (fresh: boolean) => void }) {
  const [counted, setCounted] = useState<number[]>([]);
  useEffect(() => {
    say('Tap each one and count them. How many are there?');
  }, []);
  const tap = (i: number) => {
    const fresh = !counted.includes(i);
    onTap?.(fresh);
    if (!fresh) return;
    sounds.tap(counted.length + 1);
    setCounted([...counted, i]);
  };
  return (
    <Stage prompt="Tap each one to count them!">
      <ObjectCard emoji={q.emoji} count={q.answer} counted={counted} onTap={chosen === null ? tap : undefined} />
      <AnswerRow options={q.options} answer={q.answer} chosen={chosen} onPick={onAnswer} />
    </Stage>
  );
}

function Find({ q, chosen, onAnswer, onReplay }: { q: Q<'find'>; chosen: number | null; onAnswer: (n: number) => void; onReplay?: () => void }) {
  // Said once. "Hear it again" is there for a repeat, and saying it twice unprompted just talks over her.
  const speak = useCallback(() => say(`Find the number ${numberWord(q.answer)}.`), [q.answer]);
  useEffect(() => {
    speak();
  }, [speak]);
  return (
    <Stage
      prompt={
        <>
          Find the number… <b className="text-raspberry">listen!</b> 🔊
        </>
      }
    >
      <AnswerRow options={q.options} answer={q.answer} chosen={chosen} onPick={onAnswer} className="max-w-[700px]" />
      <Button
        variant="quiet"
        size="lg"
        onClick={() => {
          onReplay?.();
          speak();
        }}
      >
        🔊 Hear it again
      </Button>
    </Stage>
  );
}

function More({ q, chosen, onAnswer }: { q: Q<'more'>; chosen: Side | null; onAnswer: (side: Side) => void }) {
  useEffect(() => {
    say('Which side has more?');
  }, []);
  return (
    <Stage
      prompt={
        <>
          Which side has <b className="text-raspberry">more</b>?
        </>
      }
    >
      <CompareSides left={q.left} right={q.right} leftEmoji={q.leftEmoji} rightEmoji={q.rightEmoji} answer={q.answer} chosen={chosen} onPick={onAnswer} />
    </Stage>
  );
}

const unicorns = (n: number) => `${numberWord(n)} unicorn${n === 1 ? '' : 's'}`;
const comes = (n: number) => (n === 1 ? 'comes' : 'come');

function Add({ q, chosen, onAnswer, stepMs, onReady }: { q: Q<'add'>; chosen: number | null; onAnswer: (n: number) => void; stepMs: number; onReady?: () => void }) {
  const [arrived, setArrived] = useState(0);
  const [ready, setReady] = useState(false);
  const readyCallback = useLatest(onReady);
  useEffect(() => {
    say(`You have ${unicorns(q.base)}. Watch! Here ${comes(q.extra)} ${numberWord(q.extra)} more.`);
  }, [q]);
  useEffect(() => {
    if (arrived < q.extra) {
      // The first one waits for the sentence above to get going.
      const t = window.setTimeout(
        () => {
          sounds.pop(arrived);
          setArrived(arrived + 1);
        },
        arrived === 0 ? stepMs * 2.5 : stepMs,
      );
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setReady(true);
      readyCallback.current?.();
      say('How many now?');
    }, 600);
    return () => window.clearTimeout(t);
  }, [arrived, q.extra, stepMs, readyCallback]);
  return (
    <Stage prompt={`You have ${numberWord(q.base)}… here ${comes(q.extra)} ${numberWord(q.extra)} more!`}>
      <ObjectCard emoji="🦄" count={q.base + arrived} popFrom={q.base} />
      {ready ? <AnswerRow options={q.options} answer={q.answer} chosen={chosen} onPick={onAnswer} /> : <AnswerSpace />}
    </Stage>
  );
}

function Bond({ q, chosen, onAnswer }: { q: Q<'bond'>; chosen: number | null; onAnswer: (n: number) => void }) {
  useEffect(() => {
    say(
      q.frame
        ? `${numberWord(q.shown)} in the frame. How many more to make ${numberWord(q.whole)}?`
        : `${numberWord(q.shown)}. How many more to make ${numberWord(q.whole)}?`,
    );
  }, [q]);
  return (
    <Stage
      prompt={
        <>
          {q.shown} and how many more make <b className="text-raspberry">{q.whole}</b>?
        </>
      }
    >
      {q.frame ? (
        <FrameCard capacity={q.whole <= 5 ? 5 : 10} filled={q.shown} asking />
      ) : (
        <p className="text-[clamp(56px,12vw,104px)] font-bold leading-none text-raspberry">
          {q.shown} + <span className="text-bubble">?</span> = {q.whole}
        </p>
      )}
      <AnswerRow options={q.options} answer={q.answer} chosen={chosen} onPick={onAnswer} />
    </Stage>
  );
}

const balloons = (n: number) => `${numberWord(n)} balloon${n === 1 ? '' : 's'}`;
const floats = (n: number) => (n === 1 ? 'floats' : 'float');

function Fewer({ q, chosen, onAnswer, stepMs, onReady }: { q: Q<'fewer'>; chosen: number | null; onAnswer: (n: number) => void; stepMs: number; onReady?: () => void }) {
  const [gone, setGone] = useState(0);
  const [ready, setReady] = useState(false);
  const readyCallback = useLatest(onReady);
  useEffect(() => {
    say(`You have ${balloons(q.base)}. Watch! ${numberWord(q.taken)} ${floats(q.taken)} away.`);
  }, [q]);
  useEffect(() => {
    if (gone < q.taken) {
      const t = window.setTimeout(
        () => {
          sounds.pop(gone);
          setGone(gone + 1);
        },
        gone === 0 ? stepMs * 2.5 : stepMs,
      );
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setReady(true);
      readyCallback.current?.();
      say('How many are left?');
    }, 600);
    return () => window.clearTimeout(t);
  }, [gone, q.taken, stepMs, readyCallback]);
  return (
    <Stage prompt={`You have ${numberWord(q.base)}… ${numberWord(q.taken)} ${floats(q.taken)} away!`}>
      <ObjectCard emoji={q.emoji} count={q.base - gone} />
      {ready ? <AnswerRow options={q.options} answer={q.answer} chosen={chosen} onPick={onAnswer} /> : <AnswerSpace />}
    </Stage>
  );
}

function Teen({ q, chosen, onAnswer }: { q: Q<'teen'>; chosen: number | null; onAnswer: (n: number) => void }) {
  useEffect(() => {
    say(q.frame ? 'A full ten, and some more. How many altogether?' : `Ten and ${numberWord(q.extra)}. How many is that?`);
  }, [q]);
  return (
    <Stage
      prompt={
        <>
          Ten and <b className="text-raspberry">{q.extra}</b> more… how many?
        </>
      }
    >
      {q.frame ? (
        <div className="flex flex-wrap items-center justify-center gap-[clamp(8px,2vw,18px)]">
          <FrameCard capacity={10} filled={10} emoji="🟣" />
          <span className="text-[clamp(28px,5vw,44px)] font-bold text-grape/60">and</span>
          <div className="flex max-w-[220px] flex-wrap justify-center gap-1.5">
            {Array.from({ length: q.extra }, (_, i) => (
              <span key={i} className="text-[clamp(30px,6vw,52px)] leading-none">
                🟣
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-[clamp(48px,10vw,88px)] font-bold leading-none text-raspberry">10 + {q.extra} = ?</p>
      )}
      <AnswerRow options={q.options} answer={q.answer} chosen={chosen} onPick={onAnswer} />
    </Stage>
  );
}
