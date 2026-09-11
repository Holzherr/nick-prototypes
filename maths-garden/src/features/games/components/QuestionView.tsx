import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/shared/components/ui/button';
import type { Choice, Question, Side } from '../questions';
import { numberWord, say, sounds } from '../sound';
import { AnswerRow } from './AnswerRow';
import { CompareSides } from './CompareSides';
import { DotCard } from './DotCard';
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
export function QuestionView({ question, chosen, onAnswer, peekMs = 2000, stepMs = 900 }: QuestionViewProps) {
  switch (question.game) {
    case 'peek':
      return <Peek q={question} chosen={asNumber(chosen)} onAnswer={onAnswer} peekMs={question.peekMs ?? peekMs} />;
    case 'count':
      return <Count q={question} chosen={asNumber(chosen)} onAnswer={onAnswer} />;
    case 'find':
      return <Find q={question} chosen={asNumber(chosen)} onAnswer={onAnswer} />;
    case 'more':
      return <More q={question} chosen={asSide(chosen)} onAnswer={onAnswer} />;
    case 'add':
      return <Add q={question} chosen={asNumber(chosen)} onAnswer={onAnswer} stepMs={stepMs} />;
  }
}

function Peek({ q, chosen, onAnswer, peekMs }: { q: Q<'peek'>; chosen: number | null; onAnswer: (n: number) => void; peekMs: number }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    say('How many dots? Look quickly!');
    const t = window.setTimeout(() => setHidden(true), peekMs);
    return () => window.clearTimeout(t);
  }, [peekMs]);
  return (
    <Stage prompt="How many dots? Look quickly! 👀">
      <DotCard count={q.answer} arrangement={q.arrangement} seed={q.seed} hidden={hidden && chosen === null} />
      {hidden ? <AnswerRow options={q.options} answer={q.answer} chosen={chosen} onPick={onAnswer} /> : <AnswerSpace />}
    </Stage>
  );
}

function Count({ q, chosen, onAnswer }: { q: Q<'count'>; chosen: number | null; onAnswer: (n: number) => void }) {
  const [counted, setCounted] = useState<number[]>([]);
  useEffect(() => {
    say('Tap each one and count them. How many are there?');
  }, []);
  const tap = (i: number) => {
    if (counted.includes(i)) return;
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

function Find({ q, chosen, onAnswer }: { q: Q<'find'>; chosen: number | null; onAnswer: (n: number) => void }) {
  const speak = useCallback(() => say(`Find the number ${numberWord(q.answer)}. ${numberWord(q.answer)}!`), [q.answer]);
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
      <Button variant="quiet" size="lg" onClick={speak}>
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

function Add({ q, chosen, onAnswer, stepMs }: { q: Q<'add'>; chosen: number | null; onAnswer: (n: number) => void; stepMs: number }) {
  const [arrived, setArrived] = useState(0);
  const [ready, setReady] = useState(false);
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
      say('How many now?');
    }, 600);
    return () => window.clearTimeout(t);
  }, [arrived, q.extra, stepMs]);
  return (
    <Stage prompt={`You have ${numberWord(q.base)}… here ${comes(q.extra)} ${numberWord(q.extra)} more!`}>
      <ObjectCard emoji="🦄" count={q.base + arrived} popFrom={q.base} />
      {ready ? <AnswerRow options={q.options} answer={q.answer} chosen={chosen} onPick={onAnswer} /> : <AnswerSpace />}
    </Stage>
  );
}
