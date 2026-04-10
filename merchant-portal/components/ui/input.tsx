import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode;
  trailingSlot?: React.ReactNode;
}

export default function Input({ className, leadingIcon, trailingSlot, ...props }: InputProps) {
  return (
    <div className={cn('relative w-full', className)}>
      {leadingIcon ? (
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-zinc-600">
          {leadingIcon}
        </div>
      ) : null}
      <input
        className={cn(
          'h-[55px] w-full rounded-full bg-[#F3F4F6] px-6 text-base text-zinc-900 placeholder:text-zinc-500 outline-none ring-0',
          leadingIcon ? 'pl-12' : '',
          trailingSlot ? 'pr-[52px]' : '',
          'focus:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary/30',
        )}
        {...props}
      />
      {trailingSlot ? (
        <div className="absolute inset-y-0 right-0 flex items-center pr-4">{trailingSlot}</div>
      ) : null}
    </div>
  );
}
