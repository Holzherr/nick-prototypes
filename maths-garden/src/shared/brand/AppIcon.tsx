import { cn } from '@/shared/utils/cn';
import { UnicornMark } from './UnicornMark';

/** Pink gradient tile (bubble → raspberry, iOS 22.5% radius) with the unicorn. Also rendered to public/icons. */
export const AppIcon = ({ size = 64, className }: { size?: number; className?: string }) => (
  <span
    aria-hidden
    className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden bg-linear-to-br from-bubble to-raspberry', className)}
    style={{ width: size, height: size, borderRadius: size * 0.225 }}
  >
    <UnicornMark size={size * 0.86} />
  </span>
);
