import type { Layout } from './patterns';

const FILL = ['#e0326e', '#6b2d5c'] as const;
const HALO = ['#ffe9f1', '#efe4ff'] as const;

/** "dot" draws circles; anything else is drawn as that emoji at each spot. */
const Mark = ({ x, y, r, group, icon }: { x: number; y: number; r: number; group: 0 | 1; icon: string }) =>
  icon === 'dot' ? (
    <circle cx={x} cy={y} r={r} fill={FILL[group]} />
  ) : (
    <text x={x} y={y} fontSize={r * 2.1} textAnchor="middle" dominantBaseline="central">
      {icon}
    </text>
  );

/** SVG content (no <svg>) for a subitising layout in the 100 × 72 box: dots or emoji, group halos, frame grid. */
export function Pattern({ layout, icon = 'dot' }: { layout: Layout; icon?: string }) {
  if (layout.kind === 'frame') {
    const { rows, columns, cell, x, y, filled } = layout;
    return (
      <g>
        {Array.from({ length: rows * columns }, (_, i) => {
          const cx = x + (i % columns) * cell;
          const cy = y + Math.floor(i / columns) * cell;
          return (
            <g key={i}>
              <rect x={cx} y={cy} width={cell} height={cell} fill="#fffdf9" stroke="#6b2d5c" strokeWidth={0.9} />
              {i < filled && <Mark x={cx + cell / 2} y={cy + cell / 2} r={cell * 0.33} group={0} icon={icon} />}
            </g>
          );
        })}
      </g>
    );
  }
  return (
    <g>
      {layout.halos.map((h, i) => (
        <rect key={i} x={h.x} y={h.y} width={h.w} height={h.h} rx={9} fill={HALO[i % 2]} />
      ))}
      {layout.spots.map((s, i) => (
        <Mark key={i} {...s} icon={icon} />
      ))}
    </g>
  );
}
