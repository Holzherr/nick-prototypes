import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';
import { StrawberryMark } from './strawberry-mark';

const logoVariants = cva('inline-flex items-center font-semibold tracking-tight text-foreground', {
  variants: {
    size: {
      sm: 'gap-1.5 text-[15px] [&_svg]:size-5',
      md: 'gap-2 text-[19px] [&_svg]:size-7',
      lg: 'gap-2.5 text-[28px] [&_svg]:size-10',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface LogoProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof logoVariants> {
  /** Mark only, no wordmark — the header on a phone uses this. */
  markOnly?: boolean;
}

/** Lockup: the berry at cap height, then "Strawberry" in ink. */
export const Logo = ({ size, markOnly, className, ...props }: LogoProps) => (
  <span className={cn(logoVariants({ size }), className)} {...props}>
    <StrawberryMark />
    {!markOnly && <span>Strawberry</span>}
  </span>
);
