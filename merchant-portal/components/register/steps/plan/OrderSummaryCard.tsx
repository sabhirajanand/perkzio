import Button from '@/components/ui/button';

export interface OrderSummaryLineItem {
  label: string;
  value: string;
  muted?: boolean;
}

export interface OrderSummaryCardProps {
  planLabel: string;
  lines: OrderSummaryLineItem[];
  totalLabel: string;
  ctaLabel: string;
  onCta: () => void;
  disabled?: boolean;
}

export default function OrderSummaryCard({
  planLabel,
  lines,
  totalLabel,
  ctaLabel,
  onCta,
  disabled,
}: OrderSummaryCardProps) {
  return (
    <div className="rounded-[32px] bg-white p-8 shadow-[0_0_28px_rgba(0,0,0,0.10)]">
      <p className="text-2xl font-extrabold text-black">Order Summary</p>

      <div className="mt-6 space-y-4 text-sm">
        <div className="flex items-start justify-between gap-6">
          <p className="whitespace-pre-line text-zinc-600">{planLabel}</p>
          <p className="font-extrabold text-black">{lines[0]?.value ?? ''}</p>
        </div>

        {lines.slice(1).map((l) => (
          <div key={l.label} className="flex items-start justify-between gap-6">
            <p className={l.muted ? 'text-zinc-400' : 'text-zinc-600'}>{l.label}</p>
            <p className="font-extrabold text-black">{l.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between gap-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-zinc-500">Total due today</p>
        </div>
        <p className="text-[34px] font-black leading-10 text-black">{totalLabel}</p>
      </div>

      <div className="mt-8">
        <Button
          type="button"
          size="lg"
          className="h-14 w-full rounded-full bg-gradient-to-r from-primary to-[#E91E8C] px-10 text-base font-extrabold shadow-[0_18px_40px_-18px_rgba(241,30,105,0.9)] hover:brightness-95"
          onClick={onCta}
          disabled={disabled}
        >
          <span className="inline-flex items-center gap-2">
            {ctaLabel}
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path
                d="M9 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Button>
        <p className="mt-3 text-center text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] text-zinc-400">
          By clicking, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}

