import { numberWord } from '@/features/games/sound';
import { CARD_H, CARD_W, layout } from './patterns';
import type { CardFace } from './cards';
import { Pattern } from './Pattern';

export interface SubitisingCardProps {
  face: CardFace;
  icon: string;
  /** Printed small in the bottom-left corner. */
  name?: string;
  /** Small numeral in the bottom-right corner of dot cards. */
  answerCorner?: boolean;
}

const FONT = 'Fredoka, ui-rounded, system-ui, sans-serif';

/** One printable card (100 × 72 units, scales to its cell): cream face, petal edge, dots/emoji pattern or a big numeral with its word. */
export const SubitisingCard = ({ face, icon, name, answerCorner = false }: SubitisingCardProps) => (
  <svg
    viewBox={`0 0 ${CARD_W} ${CARD_H}`}
    className="block h-full max-h-full w-full max-w-full"
    role="img"
    aria-label={face.kind === 'dots' ? `${face.n} in a ${face.arrangement} pattern` : `Numeral ${face.n}`}
    fontFamily={FONT}
  >
    <rect x={0.8} y={0.8} width={CARD_W - 1.6} height={CARD_H - 1.6} rx={6} fill="#fffdf9" stroke="#e7a9c1" strokeWidth={0.8} />
    {face.kind === 'dots' ? (
      <Pattern layout={layout(face.n, face.arrangement, face.seed)} icon={icon} />
    ) : (
      <g fill="#e0326e" textAnchor="middle">
        <text x={CARD_W / 2} y={40} fontSize={34} fontWeight={700} dominantBaseline="central">
          {face.n}
        </text>
        <text x={CARD_W / 2} y={62} fontSize={7} fontWeight={500} fill="#6b2d5c">
          {numberWord(face.n)}
        </text>
      </g>
    )}
    {name && (
      <text x={5} y={68} fontSize={3.4} fill="#6b2d5c" opacity={0.55}>
        {name}
      </text>
    )}
    {answerCorner && face.kind === 'dots' && (
      <text x={CARD_W - 5} y={68} fontSize={4.5} fontWeight={600} textAnchor="end" fill="#6b2d5c" opacity={0.55}>
        {face.n}
      </text>
    )}
  </svg>
);
