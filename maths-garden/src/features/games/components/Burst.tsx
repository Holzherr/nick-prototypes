import { useState, type CSSProperties } from 'react';

const EMOJI = ['💖', '⭐', '🌸', '💗', '✨', '🦄'];

/** A one-shot shower of emoji flying out from a point (centre of the screen by default). Remount with a new key to replay. */
export function Burst({ x = '50%', y = '45%' }: { x?: string; y?: string }) {
  const [pieces] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      emoji: EMOJI[i % EMOJI.length],
      dx: Math.random() * 360 - 180,
      dy: Math.random() * 300 - 240,
      rot: Math.random() * 360 - 180,
    })),
  );
  return (
    <div aria-hidden className="pointer-events-none fixed z-50" style={{ left: x, top: y }}>
      {pieces.map((p, i) => (
        <span key={i} className="absolute animate-fly text-[34px]" style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--rot': `${p.rot}deg` } as CSSProperties}>
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
