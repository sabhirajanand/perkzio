import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function Select({
  id,
  value,
  onValueChange,
  options,
  placeholder = 'Select',
  disabled,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === value);
    return found?.label ?? '';
  }, [options, value]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className={cn(
          'flex h-[60px] w-full items-center justify-between gap-3 rounded-[10px] bg-[#F3F4F6] px-5 text-base text-zinc-900 outline-none',
          'focus:bg-zinc-50 focus:ring-2 focus:ring-primary/30',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        )}
      >
        <span className={cn('min-w-0 truncate text-left', value ? 'text-zinc-900' : 'text-zinc-500')}>
          {value ? selectedLabel : placeholder}
        </span>
        <ChevronDown className={cn('h-5 w-5 shrink-0 text-zinc-600 transition-transform', open ? 'rotate-180' : '')} />
      </button>

      {open ? (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 max-h-[280px] overflow-auto rounded-[14px] border border-black/10 bg-white p-2 shadow-[0_18px_45px_-25px_rgba(0,0,0,0.45)]"
        >
          {options.map((o) => {
            const isSelected = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={o.disabled}
                onClick={() => {
                  if (o.disabled) return;
                  onValueChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-[12px] px-4 py-3 text-left text-base font-semibold',
                  o.disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-[#F3F4F6]',
                  isSelected ? 'bg-[#F3F4F6] text-zinc-900' : 'text-zinc-800',
                )}
              >
                <span className="min-w-0 truncate">{o.label}</span>
                {isSelected ? <span className="text-sm font-black text-primary">Selected</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

