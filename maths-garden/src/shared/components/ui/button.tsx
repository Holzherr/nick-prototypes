import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/utils/cn';

export const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-2 font-semibold transition-transform duration-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bubble/40 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'rounded-full bg-bubble text-white candy-raspberry [--candy:8px] active:translate-y-[5px] active:[--candy:3px]',
        quiet: 'rounded-full bg-cream text-grape candy-petal [--candy:8px] active:translate-y-[5px] active:[--candy:3px]',
        answer: 'rounded-full bg-bubble font-bold text-white candy-raspberry active:translate-y-1.5 active:[--candy:3px]',
        right: 'animate-bounce-once rounded-full bg-leaf font-bold text-white candy-leaf-deep',
        wrong: 'animate-wobble rounded-full bg-petal font-bold text-raspberry candy-bubble',
        ghost: 'rounded-full font-medium text-grape/60 hover:text-grape',
      },
      size: {
        sm: 'h-10 px-4 text-base',
        md: 'h-12 px-6 text-lg',
        lg: 'min-h-[68px] px-10 text-[clamp(20px,2.6vw,26px)]',
        answer: 'size-[clamp(84px,14vw,118px)] text-[clamp(38px,6vw,52px)]',
        icon: 'size-[58px] text-[26px]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export const Button = ({ className, variant, size, type = 'button', ...props }: ButtonProps) => (
  <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
);
