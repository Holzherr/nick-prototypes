import type { Stage } from '../characters';

const SKIN = '#ffd9b8';
const HAIR = '#7c3aed';
const INK = '#3b2a5c';
const GOLD = '#ffc94d';

/** A five-point star of radius 1 around (0, 0); place with translate and scale. */
const STAR = 'M0 -1 L0.235 -0.324 L0.951 -0.309 L0.38 0.124 L0.588 0.809 L0 0.4 L-0.588 0.809 L-0.38 0.124 L-0.951 -0.309 L-0.235 -0.324 Z';
const Star = ({ x, y, r, fill = GOLD, opacity = 1 }: { x: number; y: number; r: number; fill?: string; opacity?: number }) => (
  <path d={STAR} transform={`translate(${x} ${y}) scale(${r})`} fill={fill} opacity={opacity} />
);

/** How tall she stands at each stage, from her feet; the top stage fills the box. */
const HEIGHT = [0.72, 0.8, 0.88, 0.95, 1];

/** Where the stars of the top stage fall around her, and where the sparkles sit on her dress: x, y, size. */
const SHOWER = [[12, 22, 3.2], [88, 18, 3.6], [8, 62, 2.4], [92, 58, 2.8], [20, 6, 2], [78, 4, 2.6]];
const SPARKLES = [[44, 78, 2.4], [57, 88, 2.2], [50, 70, 1.8], [36, 90, 1.6], [64, 74, 1.6]];

/**
 * Nova as SVG, drawn upward from her feet at the bottom middle of a 100 × 120 box. Stage 1 is the small girl
 * waving; each stage adds a layer and a little height: 2 a microphone, 3 a sparkly dress and headphones,
 * 4 a stage disc under a spotlight, 5 a tiara and a shower of stars. Sized by its container like an emoji.
 */
export const Nova = ({ stage, size }: { stage: Stage; size: number }) => (
  <svg viewBox="0 0 100 120" width={size} height={size * 1.2} aria-hidden>
    {stage >= 4 && <path d="M50 0 L14 112 L86 112 Z" fill="#fff6a8" opacity={0.4} />}
    {stage >= 4 && <ellipse cx={50} cy={112} rx={38} ry={7} fill="#6a2bd1" />}
    {stage >= 4 && <ellipse cx={50} cy={110} rx={31} ry={4.6} fill="#9b5cff" />}
    <g transform={`translate(50 112) scale(${HEIGHT[stage - 1]}) translate(-50 -112)`}>
      {/* Legs and shoes */}
      <rect x={42} y={90} width={6.5} height={20} rx={3} fill={SKIN} />
      <rect x={51.5} y={90} width={6.5} height={20} rx={3} fill={SKIN} />
      <ellipse cx={44.5} cy={110} rx={5} ry={2.4} fill="#e0326e" />
      <ellipse cx={55.5} cy={110} rx={5} ry={2.4} fill="#e0326e" />
      {/* Arms: the left one waves, the right one holds the microphone from stage 2 */}
      <path d="M40 66 L26 50" stroke={SKIN} strokeWidth={7} strokeLinecap="round" />
      <circle cx={25} cy={48} r={4.6} fill={SKIN} />
      <path d="M60 66 L73 86" stroke={SKIN} strokeWidth={7} strokeLinecap="round" />
      {/* Dress */}
      <path d="M38 62 Q50 58 62 62 L72 96 Q50 102 28 96 Z" fill={stage >= 3 ? '#e08cff' : '#c9a7ff'} />
      {stage >= 3 && SPARKLES.map(([x, y, r]) => <Star key={`${x}-${y}`} x={x} y={y} r={r} />)}
      {stage >= 2 && (
        <>
          <path d="M74 88 L81 100" stroke={INK} strokeWidth={3.6} strokeLinecap="round" />
          <circle cx={73} cy={86} r={5.4} fill="#6b2d5c" />
          <circle cx={71.5} cy={84.5} r={1.6} fill="#c9a7ff" />
        </>
      )}
      {/* Head: hair behind, face, fringe on top */}
      <circle cx={50} cy={38} r={23} fill={HAIR} />
      <ellipse cx={30} cy={50} rx={6.5} ry={13} fill={HAIR} />
      <ellipse cx={70} cy={50} rx={6.5} ry={13} fill={HAIR} />
      <circle cx={50} cy={43} r={18} fill={SKIN} />
      <path d="M32 40 Q50 18 68 40 Q59 33 50 36 Q41 33 32 40 Z" fill={HAIR} />
      {[43, 57].map((x) => (
        <g key={x}>
          <circle cx={x} cy={45} r={2.8} fill={INK} />
          <circle cx={x + 1} cy={44} r={0.9} fill="#fff" />
          <circle cx={x + (x < 50 ? -4.5 : 4.5)} cy={50} r={2.6} fill="#ff9ec4" opacity={0.7} />
        </g>
      ))}
      <path d="M44.5 53 Q50 58 55.5 53" stroke="#b3541e" strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Star x={66} y={30} r={4} />
      {stage >= 3 && (
        <>
          <path d="M29 38 A21 21 0 0 1 71 38" stroke="#ff7bac" strokeWidth={3} fill="none" />
          <rect x={25} y={36} width={8} height={12} rx={3.5} fill="#ff7bac" />
          <rect x={67} y={36} width={8} height={12} rx={3.5} fill="#ff7bac" />
        </>
      )}
      {stage >= 5 && (
        <>
          <path d="M37 30 L42 17 L50 26 L58 17 L63 30 Z" fill={GOLD} stroke="#e0a800" strokeWidth={1} strokeLinejoin="round" />
          <Star x={50} y={20} r={2.6} fill="#ff7bac" />
        </>
      )}
    </g>
    {stage >= 5 && SHOWER.map(([x, y, r]) => <Star key={`${x}-${y}`} x={x} y={y} r={r} opacity={0.9} />)}
  </svg>
);
