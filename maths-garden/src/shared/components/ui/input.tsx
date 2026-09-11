import type { ComponentProps } from 'react';
import { cn } from '@/shared/utils/cn';

export const Input = ({ className, ...props }: ComponentProps<'input'>) => (
  <input
    className={cn(
      'h-12 w-full rounded-2xl border-2 border-petal bg-white px-4 text-grape outline-none transition-colors placeholder:text-grape/40 focus:border-bubble',
      className,
    )}
    {...props}
  />
);
