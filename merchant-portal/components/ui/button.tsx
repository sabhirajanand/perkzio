import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none',
        size === 'sm' && 'h-9 px-4 text-sm',
        size === 'md' && 'h-11 px-6 text-sm',
        size === 'lg' && 'h-14 px-8 text-base',
        variant === 'primary' &&
          'bg-primary text-white shadow-[0_10px_40px_-10px_rgba(241,30,105,0.40)] hover:brightness-95',
        variant === 'secondary' && 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
        variant === 'outline' && 'border border-black/10 bg-white text-zinc-900 hover:bg-zinc-50',
        variant === 'ghost' && 'bg-transparent text-zinc-900 hover:bg-zinc-100',
        className,
      )}
      {...props}
    />
  );
}
