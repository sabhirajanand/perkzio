'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils/cn';

export type LabelProps = LabelPrimitive.LabelProps;

export default function Label({ className, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'block px-1 text-xs font-bold uppercase tracking-[0.1em] text-zinc-600',
        className,
      )}
      {...props}
    />
  );
}
