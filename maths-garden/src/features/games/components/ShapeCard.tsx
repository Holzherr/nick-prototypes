import { cn } from '@/shared/utils/cn';
import { polygonPoints, SHAPES, starPoints, type ShapeId } from '../shapes';

/**
 * How far to turn each shape so it sits the way a child would draw it: a square on its side rather than on
 * its corner, a hexagon with a flat top like a honeycomb cell.
 */
const UPRIGHT: Record<ShapeId, number> = {
  circle: 0,
  oval: 0,
  rectangle: 0,
  hexagon: 0,
  octagon: -22.5,
  square: -45,
  triangle: -90,
  pentagon: -90,
  // Drawn upright already, because a diamond has to be taller than it is wide to not just be a square.
  rhombus: 0,
  star: -90,
};

export interface ShapeCardProps {
  shape: ShapeId;
  /** Extra degrees on top of the upright angle: a square on its corner is still a square. */
  rotate?: number;
  fill?: string;
  className?: string;
}

/** One shape, drawn to fill its box. The name is the accessible label, never printed beside it. */
export function ShapeCard({ shape, rotate = 0, fill = '#ff7bac', className }: ShapeCardProps) {
  const { sides, name } = SHAPES[shape];
  return (
    <svg viewBox="-1.15 -1.15 2.3 2.3" className={cn('block', className)} role="img" aria-label={name}>
      <g transform={`rotate(${UPRIGHT[shape] + rotate})`}>
        {shape === 'circle' ? (
          <circle r={1} fill={fill} />
        ) : shape === 'oval' ? (
          <ellipse rx={1} ry={0.64} fill={fill} />
        ) : shape === 'rectangle' ? (
          <rect x={-1} y={-0.58} width={2} height={1.16} rx={0.06} fill={fill} />
        ) : shape === 'rhombus' ? (
          // Unequal diagonals on purpose: a regular four-sided polygon is a square whichever way it is
          // turned, so drawing the diamond that way would give "which one is the square?" two right answers.
          <polygon points="0,-1 0.62,0 0,1 -0.62,0" fill={fill} />
        ) : shape === 'star' ? (
          <polygon points={starPoints()} fill={fill} />
        ) : (
          <polygon points={polygonPoints(sides)} fill={fill} />
        )}
      </g>
    </svg>
  );
}
