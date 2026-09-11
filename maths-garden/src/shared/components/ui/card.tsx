import type { ComponentProps } from 'react';
import { cn } from '@/shared/utils/cn';

/** Cream panel with a petal slab underneath; the frame for every grown-up screen. */
export const Card = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('rounded-[36px] bg-cream p-8 candy-petal [--candy:12px]', className)} {...props} />
);
