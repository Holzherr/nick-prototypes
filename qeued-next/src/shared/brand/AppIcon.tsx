import { cn } from '@/shared/utils/cn';

/** The Q tile: pink→purple→blue gradient square with a white bold Q. Header mark and app icon. */
export const AppIcon = ({ size = 32, className }: { size?: number; className?: string }) => (
  <span
    className={cn('flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 font-bold text-white shadow-sm', className)}
    style={{ width: size, height: size, fontSize: size * 0.45 }}
    aria-hidden
  >
    Q
  </span>
);
