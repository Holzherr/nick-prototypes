import { Pattern } from '@/features/resources/subitising/Pattern';
import { CARD_H, CARD_W, layout, type Arrangement } from '@/features/resources/subitising/patterns';

export interface DotCardProps {
  count: number;
  /** Same arrangements as the printable Quick Peek cards. */
  arrangement?: Arrangement;
  seed?: number;
  /** Covers the dots with a pink flap and a 🙈. */
  hidden?: boolean;
}

/** Big cream card showing a subitising pattern (dice, scattered, row, frame or two groups). */
export const DotCard = ({ count, arrangement = 'dice', seed = 1, hidden = false }: DotCardProps) => (
  <div
    role="img"
    aria-label={hidden ? 'Dots hidden' : `${count} dots`}
    className="relative aspect-[100/72] w-[min(84vw,520px)] rounded-[44px] bg-cream p-[clamp(8px,2vw,18px)] candy-petal [--candy:12px]"
  >
    <svg viewBox={`0 0 ${CARD_W} ${CARD_H}`} className="block h-full w-full">
      <Pattern layout={layout(count, arrangement, seed)} />
    </svg>
    {hidden && <span className="absolute inset-0 flex items-center justify-center rounded-[44px] bg-bubble text-[90px]">🙈</span>}
  </div>
);
