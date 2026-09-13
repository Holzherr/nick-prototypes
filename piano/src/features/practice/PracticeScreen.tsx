import { useEffect, useState } from 'react';
import { HandPanel } from '@/features/hands/HandPanel.tsx';
import { Keyboard } from '@/features/keyboard/Keyboard.tsx';
import { Staff } from '@/features/notation/Staff.tsx';
import { fingersUsed, guidance, positionMap } from '@/features/score/music.ts';
import type { Hand, Piece } from '@/features/score/types.ts';
import { Guidance } from './Guidance.tsx';
import { NoteStrip } from './NoteStrip.tsx';
import { Transport } from './Transport.tsx';
import { usePractice } from './usePractice.ts';

function useStickyFlag(key: string, initial: boolean) {
  const [on, setOn] = useState(() => {
    try {
      const v = localStorage.getItem(key);
      return v === null ? initial : v === '1';
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, on ? '1' : '0'); } catch { /* private window */ }
  }, [key, on]);
  return [on, () => setOn(v => !v)] as const;
}

export function PracticeScreen({ piece }: { piece: Piece }) {
  const [showScore, toggleScore] = useStickyFlag('piano.score', true);
  const [showLetters, toggleLetters] = useStickyFlag('piano.letters', true);
  const [soundOn, toggleSound] = useStickyFlag('piano.sound', true);
  const p = usePractice(piece, soundOn);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') p.goTo(p.index + 1);
      else if (e.key === 'ArrowLeft') p.goTo(p.index - 1);
      else if (e.key === ' ') { e.preventDefault(); p.playing ? p.stop() : p.playAlong(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [p]);

  const handProps = (hand: Hand) => ({
    hand,
    position: positionMap(piece, hand),
    used: fingersUsed(piece, hand),
    playing: p.note.hand === hand ? p.note.finger : null,
    preparing: p.next && p.next.hand === hand && p.note.hand !== hand ? p.next.finger : null,
  });

  const handColour = p.note.hand === 'R' ? 'var(--rh)' : 'var(--lh)';
  const nextColour = p.next ? (p.next.hand === 'R' ? 'var(--rh)' : 'var(--lh)') : 'transparent';

  return (
    <div className="wrap" style={{ ['--hand-c' as string]: handColour, ['--next-c' as string]: nextColour }}>
      <header className="top">
        <div>
          <p className="eyebrow">{piece.source}</p>
          <h1>{piece.title}</h1>
          <p className="src">
            {piece.beatsPerBar}/4 &middot; no sharps or flats &middot; the tune swaps between her hands
            &mdash; solid finger plays now, dashed finger is next
          </p>
          <p className="src">
            Both thumbs start on middle C. Curved fingers, like keeping Mouse warm under the bridge.
          </p>
        </div>
        <div className="legend">
          <span className="lg"><span className="dot r" />Right hand</span>
          <span className="lg"><span className="dot l" />Left hand</span>
        </div>
      </header>

      <section className="now">
        <div className="hands">
          <HandPanel {...handProps('L')} />
          <HandPanel {...handProps('R')} />
        </div>
        <Guidance text={guidance(piece, p.index)} note={p.note} />
      </section>

      {showScore && (
        <Staff
          piece={piece}
          current={p.index}
          played={p.played}
          showLetters={showLetters}
          onSelect={p.goTo}
        />
      )}

      <Keyboard
        piece={piece}
        target={p.note.pitch}
        next={p.next?.pitch}
        showLetters={showLetters}
        onPress={p.press}
      />

      <NoteStrip piece={piece} current={p.index} played={p.played} onSelect={p.goTo} />

      <Transport
        playing={p.playing}
        bpm={p.bpm}
        showScore={showScore}
        showLetters={showLetters}
        soundOn={soundOn}
        onPrev={() => p.goTo(p.index - 1)}
        onNext={() => p.goTo(p.index + 1)}
        onHear={() => p.play(p.note.pitch, 1.2)}
        onPlayAlong={() => (p.playing ? p.stop() : p.playAlong())}
        onRestart={p.restart}
        onBpm={p.setBpm}
        onToggleScore={toggleScore}
        onToggleLetters={toggleLetters}
        onToggleSound={toggleSound}
      />

      {!piece.verified && (
        <p className="note-foot">
          <b>For Nick:</b> transcribed from a photo of {piece.source} &mdash; {piece.notes.length} notes.
          Fingering follows middle-C position, which matches the two fingerings the book actually prints.
          Press <b>Play along</b> and check it against the page before Tara trusts it.
        </p>
      )}
    </div>
  );
}
