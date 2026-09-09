import { cn } from '@/shared/utils/cn';
import { StrawberryMark } from './strawberry-mark';

/**
 * Home-screen tile: the berry centred on white inside a hairline-bordered squircle. The PNGs in
 * public/icons are rendered from this, so change them together.
 */
export const AppIcon = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'inline-flex aspect-square items-center justify-center rounded-[22%] border border-border bg-white',
      className,
    )}
    {...props}
  >
    <StrawberryMark className="size-[62%]" />
  </div>
);
