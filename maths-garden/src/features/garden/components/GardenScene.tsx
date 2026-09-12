import type { GameId } from '@/features/games/catalog';
import { cn } from '@/shared/utils/cn';
import type { Garden, Plant } from '../garden-state';

/** One flower species per game, so the bed shows at a glance what has been played. */
const FLOWERS: Record<GameId, { petal: string; centre: string; petals: number }> = {
  peek: { petal: '#ffd3e4', centre: '#ffc94d', petals: 6 },
  count: { petal: '#c9a7ff', centre: '#fffdf9', petals: 5 },
  find: { petal: '#ffc94d', centre: '#b3541e', petals: 10 },
  more: { petal: '#ff6b6b', centre: '#fffdf9', petals: 5 },
  add: { petal: '#fffdf9', centre: '#ff7bac', petals: 8 },
};

const STEM = '#3d9967';

/** A sprout, a bud, an open flower or one in full bloom, on its stem. Drawn upward from (0, 0). */
function Flower({ game, bloom, scale, fresh }: Pick<Plant, 'game' | 'bloom' | 'scale' | 'fresh'>) {
  const { petal, centre, petals } = FLOWERS[game];
  const height = [3.5, 5, 6.5, 8][bloom] * scale;
  const size = [0, 1.5, 2.2, 3][bloom] * scale;
  return (
    <g className={cn(fresh && 'origin-bottom animate-pop-in')}>
      <path d={`M0 0 C -0.6 ${-height / 2}, 0.6 ${-height / 2}, 0 ${-height}`} stroke={STEM} strokeWidth={0.55} fill="none" strokeLinecap="round" />
      <ellipse cx={-1.3 * scale} cy={-height * 0.45} rx={1.3 * scale} ry={0.6 * scale} fill={STEM} transform={`rotate(-20 ${-1.3 * scale} ${-height * 0.45})`} />
      {bloom >= 1 && <ellipse cx={1.3 * scale} cy={-height * 0.62} rx={1.1 * scale} ry={0.55 * scale} fill={STEM} transform={`rotate(20 ${1.3 * scale} ${-height * 0.62})`} />}
      {bloom === 0 ? null : bloom === 1 ? (
        <ellipse cx={0} cy={-height - 0.8} rx={size * 0.55} ry={size} fill={petal} stroke={centre} strokeWidth={0.2} />
      ) : (
        <g transform={`translate(0 ${-height - size * 0.6})`}>
          {Array.from({ length: petals }, (_, i) => (
            <ellipse key={i} cx={0} cy={-size * 0.75} rx={size * 0.42} ry={size * 0.8} fill={petal} transform={`rotate(${(360 / petals) * i})`} />
          ))}
          <circle r={size * 0.45} fill={centre} />
          {bloom === 3 && (
            <text y={-size * 1.9} fontSize={size * 1.1} textAnchor="middle">
              ✨
            </text>
          )}
        </g>
      )}
    </g>
  );
}

export interface GardenSceneProps {
  garden: Garden;
  /** A short band for the home screen, or the full bed. */
  variant?: 'strip' | 'full';
  className?: string;
  title?: string;
}

/**
 * The garden: rolling green hills, a sun, a flower for every round played (species by game, open as wide
 * as the round was good), butterflies for stickers, a rainbow on a finished daily goal and a unicorn at 50
 * stickers. Everything is derived from the round log, so it looks the same on every device.
 */
export function GardenScene({ garden, variant = 'full', className, title }: GardenSceneProps) {
  const height = variant === 'full' ? 58 : 34;
  const top = height - 30;
  const plants = variant === 'strip' ? garden.plants.slice(-14) : garden.plants;

  return (
    <svg viewBox={`0 0 100 ${height}`} className={cn('block w-full', className)} role="img" aria-label={title ?? `A garden with ${garden.plants.length} flowers`}>
      <defs>
        <linearGradient id="garden-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8fd9b0" />
          <stop offset="100%" stopColor="#5fbf8a" />
        </linearGradient>
      </defs>

      <circle cx={88} cy={top + 2} r={5} fill="#ffc94d" opacity={0.9} />
      {garden.rainbow &&
        ['#ff7bac', '#ffc94d', '#5fbf8a', '#c9a7ff'].map((colour, i) => (
          <path
            key={colour}
            d={`M4 ${top + 14} A ${46 - i * 3} ${26 - i * 3} 0 0 1 96 ${top + 14}`}
            fill="none"
            stroke={colour}
            strokeWidth={1.6}
            opacity={0.55}
            transform={`translate(0 ${i * 3})`}
          />
        ))}

      <path d={`M0 ${top + 12} Q 26 ${top + 4}, 52 ${top + 11} T 100 ${top + 8} L100 ${height} L0 ${height} Z`} fill="url(#garden-hill)" />
      <path d={`M0 ${top + 18} Q 34 ${top + 12}, 66 ${top + 19} T 100 ${top + 16} L100 ${height} L0 ${height} Z`} fill="#5fbf8a" opacity={0.55} />

      {plants.map((plant) => (
        <g key={plant.id} transform={`translate(${plant.x} ${top + 16 + plant.depth * (height - top - 18)})`}>
          <Flower {...plant} />
        </g>
      ))}

      {Array.from({ length: garden.butterflies }, (_, i) => (
        <text key={i} x={8 + ((i * 23) % 84)} y={top + 2 + ((i * 7) % 12)} fontSize={4.5} className="animate-bounce-once">
          🦋
        </text>
      ))}
      {garden.unicorn && (
        <text x={6} y={height - 2} fontSize={9}>
          🦄
        </text>
      )}
    </svg>
  );
}
