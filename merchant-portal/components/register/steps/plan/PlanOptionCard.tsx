import { cn } from '@/lib/utils/cn';

export interface PlanOptionCardProps {
  title: string;
  tierLabel: 'Standard' | 'Scaling' | 'Advanced';
  price: string;
  trialNote?: string;
  annualNote?: string;
  highlights: readonly string[];
  isActive: boolean;
  isRecommended?: boolean;
  onSelect: () => void;
}

function parsePrice(price: string): { old?: string; current: string; suffix?: string } {
  const trimmed = price.trim();
  const mdStrike = /~~([^~]+)~~\s*(.+)/.exec(trimmed);
  const value = mdStrike ? { old: mdStrike[1].trim(), current: mdStrike[2].trim() } : { current: trimmed };

  const m = /^(.+?)\s*(\/mo|\/month|\/yr|\/year)$/i.exec(value.current);
  if (!m) return { ...value };
  return { ...value, current: m[1].trim(), suffix: m[2] };
}

export default function PlanOptionCard({
  title,
  tierLabel,
  price,
  trialNote,
  annualNote,
  highlights,
  isActive,
  isRecommended,
  onSelect,
}: PlanOptionCardProps) {
  const parsed = parsePrice(price);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex h-full min-h-[520px] flex-col rounded-[32px] px-6 pb-6 pt-10 text-left transition-all',
        isActive
          ? 'bg-black text-white ring-1 ring-[#CDCDCD] shadow-[0_25px_50px_rgba(241,30,105,0.35)]'
          : 'bg-white/40 text-black shadow-[0_0_28px_rgba(0,0,0,0.10)] ring-1 ring-white/10 hover:bg-white/55',
      )}
    >
      {isRecommended ? (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-white">
          Recommended
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p
            className={cn(
              'text-xs font-bold uppercase tracking-[0.1em]',
              tierLabel === 'Scaling' ? 'text-primary' : 'text-[#4B5563]',
            )}
          >
            {tierLabel}
          </p>
          <span className={cn('text-2xl font-bold leading-8', isActive ? 'text-white' : 'text-black')}>{title}</span>
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        {parsed.old ? (
          <span className={cn('text-sm font-bold line-through', isActive ? 'text-white/50' : 'text-zinc-400')}>
            {parsed.old}
          </span>
        ) : null}
        <span className={cn('text-[30px] font-black leading-9', isActive ? 'text-white' : 'text-[#010101]')}>
          {parsed.current}
        </span>
        {parsed.suffix ? (
          <span className={cn('text-sm font-medium', isActive ? 'text-white/70' : 'text-[#4B5563]')}>
            {parsed.suffix}
          </span>
        ) : null}
      </div>
      {trialNote ? (
        <p className={cn('mt-3 text-xs font-semibold leading-relaxed', isActive ? 'text-white/80' : 'text-zinc-700')}>
          {trialNote}
        </p>
      ) : null}
      {annualNote ? (
        <p className={cn('mt-1 text-xs font-semibold', isActive ? 'text-white/60' : 'text-zinc-500')}>{annualNote}</p>
      ) : null}

      <ul className={cn('mt-7 space-y-5 pt-7 text-base font-semibold', isActive ? 'text-white/90' : 'text-zinc-900')}>
        {highlights.map((h) => (
          <li key={h} className="flex items-start gap-3 leading-relaxed">
            <span
              className={cn(
                'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                isActive ? 'bg-white text-black' : 'bg-black text-white',
              )}
              aria-hidden
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </span>
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <div
          className={cn(
            'flex h-[58px] w-full items-center justify-center rounded-full border text-base font-bold',
            isActive
              ? 'border-white/10 bg-gradient-to-r from-primary to-[#E91E8C] text-white shadow-[0_18px_40px_-18px_rgba(241,30,105,0.9)]'
              : 'border-primary bg-transparent text-primary hover:bg-primary/5',
          )}
        >
          Select {title}
        </div>
      </div>
    </button>
  );
}

