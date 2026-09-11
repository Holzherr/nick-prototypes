import { cn } from '@/shared/utils/cn';
import { packById, tiltOf, type Sticker } from '../catalog';

export interface StickerBadgeProps {
  sticker: Sticker;
  size?: number;
  /** From a perfect round: gold ring and a ✨. */
  shiny?: boolean;
  /** Copies owned; shows a ×n tag above 1. */
  count?: number;
  tilted?: boolean;
  className?: string;
}

/** A round die-cut sticker: the emoji on the pack's gradient disc with a thick white edge, tilted a few degrees. */
export const StickerBadge = ({ sticker, size = 96, shiny = false, count = 1, tilted = true, className }: StickerBadgeProps) => (
  <span
    role="img"
    aria-label={`${sticker.name} sticker${shiny ? ', sparkly' : ''}${count > 1 ? `, ${count} of them` : ''}`}
    className={cn(
      'relative inline-flex shrink-0 items-center justify-center rounded-full border-solid border-white shadow-[0_4px_12px_rgba(107,45,92,0.28)]',
      shiny && 'ring-4 ring-sunny',
      className,
    )}
    style={{
      width: size,
      height: size,
      borderWidth: Math.max(3, Math.round(size * 0.06)),
      background: packById(sticker.pack).background,
      rotate: tilted ? `${tiltOf(sticker.id)}deg` : undefined,
    }}
  >
    <span className="leading-none" style={{ fontSize: size * 0.5 }}>
      {sticker.emoji}
    </span>
    {shiny && (
      <span className="absolute -right-[10%] -top-[10%] leading-none" style={{ fontSize: size * 0.3 }}>
        ✨
      </span>
    )}
    {count > 1 && (
      <span className="absolute -bottom-[6%] -right-[8%] rounded-full bg-raspberry px-2 py-0.5 text-sm font-bold text-white">×{count}</span>
    )}
  </span>
);

/** Dashed empty circle with a "?" for a sticker not collected yet. */
export const EmptySlot = ({ size = 96 }: { size?: number }) => (
  <span
    aria-hidden
    className="inline-flex shrink-0 items-center justify-center rounded-full border-4 border-dashed border-petal text-3xl font-semibold text-petal"
    style={{ width: size, height: size }}
  >
    ?
  </span>
);
