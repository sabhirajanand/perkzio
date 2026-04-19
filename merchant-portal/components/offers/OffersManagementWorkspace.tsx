import { BarChart3, Lightbulb, Pencil, Plus, Trash2, Zap } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

const KPI: Array<
  | { label: string; value: string; delta: string; tone: 'up' | 'down' }
  | { label: string; value: string; sub: string }
> = [
  { label: 'Total Redemptions', value: '12.4k', delta: '+12%', tone: 'up' },
  { label: 'Active Offers', value: '08', sub: 'Steady' },
  { label: 'Total Value Saved', value: '$4.2k', delta: '+8%', tone: 'up' },
  { label: 'Avg. Conversion', value: '24%', delta: '-2%', tone: 'down' },
];

const OFFER_CARDS = [
  {
    status: 'ACTIVE' as const,
    title: '50% Off Signature Pastry',
    desc: 'Available weekdays before 10 AM',
    redeemed: '1,248',
    expires: 'Oct 24, 2024',
    placeholder: 'pastry' as const,
  },
  {
    status: 'ACTIVE' as const,
    title: 'Free Birthday Brew',
    desc: 'One-time reward for all members',
    redeemed: '1,248',
    expires: 'Oct 24, 2024',
    placeholder: 'coffee' as const,
  },
  {
    status: 'PAUSED' as const,
    title: 'Summer Cold Brew BOGO',
    desc: 'Seasonal promotion - Limited time',
    redeemed: '1,248',
    expires: 'Oct 24, 2024',
    placeholder: 'brew' as const,
  },
];

function Delta({ delta, tone }: { delta: string; tone: 'up' | 'down' }) {
  const cls = tone === 'up' ? 'text-emerald-600' : 'text-rose-600';
  return <p className={cn('mt-2 text-sm font-semibold', cls)}>{delta}</p>;
}

function OfferImagePlaceholder({ variant }: { variant: 'pastry' | 'coffee' | 'brew' }) {
  const grad =
    variant === 'pastry'
      ? 'from-[#EDE9E6] via-[#E8DDD4] to-[#D4C4B8]'
      : variant === 'coffee'
        ? 'from-[#E8E4E0] via-[#DDD6CE] to-[#C9B8A8]'
        : 'from-[#E5E9ED] via-[#D8DEE6] to-[#C5CCD6]';
  return (
    <div
      className={cn('relative h-full min-h-[120px] w-full bg-gradient-to-br sm:min-h-full', grad)}
      aria-label="Offer image — add artwork later"
    >
      <div className="absolute inset-0 ring-1 ring-inset ring-black/[0.04]" />
      <div className="absolute inset-2.5 rounded-xl border border-dashed border-black/[0.12] bg-white/25 sm:inset-2" />
    </div>
  );
}

function OfferCard({
  status,
  title,
  desc,
  redeemed,
  expires,
  placeholder,
}: {
  status: 'ACTIVE' | 'PAUSED';
  title: string;
  desc: string;
  redeemed: string;
  expires: string;
  placeholder: 'pastry' | 'coffee' | 'brew';
}) {
  const active = status === 'ACTIVE';
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[24px] border border-[#B3B1B4]/10 bg-white shadow-[0_4px_24px_-6px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex min-h-0 flex-1 flex-col sm:flex-row sm:items-stretch">
        <div className="flex w-full shrink-0 justify-center sm:w-[min(36%,132px)] sm:max-w-[132px] sm:self-stretch sm:justify-start sm:py-3 sm:pl-3">
          <div className="relative aspect-[5/4] w-full min-h-[128px] overflow-hidden rounded-b-[16px] sm:aspect-auto sm:h-full sm:min-h-[168px] sm:rounded-2xl sm:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]">
            <OfferImagePlaceholder variant={placeholder} />
            <span
              className={cn(
                'absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-sm backdrop-blur-sm sm:left-2 sm:top-2 sm:px-2 sm:py-0.5 sm:text-[10px]',
                active ? 'bg-emerald-700' : 'bg-[#3d3a3a]',
              )}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col px-3 pb-3 pt-3 sm:min-h-[168px] sm:px-4 sm:pb-4 sm:pt-3 sm:pl-2 sm:pr-4">
          <button
            type="button"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6] text-[#F11E69] transition hover:bg-[#ECEAEB] sm:right-3.5 sm:top-3"
            aria-label={`Edit ${title}`}
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </button>

          <h3 className="min-w-0 pr-10 font-headline text-sm font-bold leading-snug text-black sm:text-[15px] sm:leading-tight">
            {title}
          </h3>
          <p className="mt-1 text-xs font-normal leading-relaxed text-[#6B7280] sm:mt-1.5 sm:text-[13px]">{desc}</p>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-0.5 sm:mt-4 sm:gap-x-5">
            <div>
              <p className="text-[11px] font-medium text-[#9CA3AF]">Redeemed</p>
              <p className="mt-0.5 font-headline text-sm font-bold tracking-tight text-black sm:text-base">
                {redeemed}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#9CA3AF]">Expires</p>
              <p className="mt-0.5 font-headline text-sm font-bold tracking-tight text-black sm:text-base">{expires}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:mt-auto sm:flex-row sm:items-center sm:pt-3">
            <button
              type="button"
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#F11E69] px-3 text-xs font-bold text-white shadow-[0_6px_18px_-6px_rgba(241,30,105,0.45)] transition hover:brightness-105 sm:h-10 sm:min-w-0 sm:max-w-[min(100%,200px)] sm:px-4 sm:text-[13px]"
            >
              <BarChart3 className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={2} aria-hidden />
              View Stats
            </button>
            {active ? (
              <button
                type="button"
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-black px-5 text-xs font-bold text-white transition hover:bg-zinc-800 sm:h-10 sm:px-6 sm:text-[13px]"
              >
                Pause
              </button>
            ) : (
              <button
                type="button"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white transition hover:bg-zinc-800 sm:h-10 sm:w-10"
                aria-label={`Delete ${title}`}
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function ConversionPeakPanel() {
  const bars = [
    { fill: 0.78 },
    { fill: 0.52 },
    { fill: 0.91 },
  ];
  return (
    <div className="relative flex flex-1 items-center justify-center bg-white px-6 py-8 sm:px-10 lg:min-h-[328px] lg:self-stretch lg:py-10">
      <div
        className="relative flex w-full max-w-[280px] min-h-[300px] flex-col justify-between rounded-[28px] bg-[#FF3377] p-6 text-white shadow-[0_20px_50px_-12px_rgba(255,51,119,0.55)] sm:max-w-[300px] sm:min-h-[312px] sm:p-7 lg:max-w-[320px] lg:min-h-[320px]"
        style={{ transform: 'rotate(3deg)' }}
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/25 sm:h-11 sm:w-11">
              <Zap className="h-5 w-5 text-white sm:h-5 sm:w-5" strokeWidth={2} aria-hidden />
            </div>
            <p className="min-w-0 font-headline text-base font-bold leading-tight sm:text-lg">Conversion Peak</p>
          </div>
          <div className="mt-3 space-y-1.5 sm:mt-3.5">
            {bars.map((b, i) => (
              <div
                key={i}
                className="h-1.5 overflow-hidden rounded-full bg-white/95 shadow-inner sm:h-2"
                aria-hidden
              >
                <div
                  className="h-full rounded-full bg-[#1a1a1a]"
                  style={{ width: `${Math.round(b.fill * 100)}%` }}
                />
              </div>
            ))}
          </div>
        </div>
        <p className="pt-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/95 sm:pt-4">
          Real-time engagement tracking
        </p>
      </div>
    </div>
  );
}

export default function OffersManagementWorkspace() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="font-headline text-4xl font-semibold leading-none tracking-tight text-[#333235] md:text-5xl md:leading-none">
            Offers Management
          </h1>
          <p className="max-w-3xl text-lg font-medium leading-7 text-[#4B5563]">
            Drive customer traffic with high-conversion rewards.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#F11E69] to-[#FF4FA3] px-8 text-base font-bold text-white shadow-[0_10px_40px_-10px_rgba(241,30,105,0.4)] transition hover:brightness-95"
        >
          <Plus className="h-5 w-5" strokeWidth={2} aria-hidden />
          Create New Offer
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Offer KPIs">
        {KPI.map((k) => (
          <div
            key={k.label}
            className="rounded-[24px] border border-[#B3B1B4]/10 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#605E61]">{k.label}</p>
            <p className="mt-2 font-headline text-3xl font-bold tracking-tight text-[#333235]">{k.value}</p>
            {'sub' in k ? <p className="mt-2 text-sm text-[#6B7280]">{k.sub}</p> : <Delta delta={k.delta} tone={k.tone} />}
          </div>
        ))}
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-headline text-2xl font-bold text-black">Live Offers</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full bg-[#F11E69] px-4 py-2 text-xs font-bold text-white shadow-sm"
          >
            All
          </button>
          <button
            type="button"
            className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white"
          >
            Flash Sales
          </button>
          <button
            type="button"
            className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white"
          >
            Seasonal
          </button>
        </div>
      </div>

      <div className="border-b border-[#FFFBF0] bg-[#FFFBF0] px-4 py-3 text-center text-xs font-semibold text-amber-900/90 sm:px-8">
        Preview: sample data for layout &amp; UX — connect live offers when your API is ready.
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {OFFER_CARDS.map((o) => (
            <OfferCard key={o.title} {...o} />
          ))}
        </div>

        <div className="rounded-[28px] border border-[#B3B1B4]/10 bg-white shadow-[0_4px_28px_-8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] lg:flex lg:min-h-[328px] lg:items-stretch lg:overflow-hidden">
          <div className="flex flex-1 flex-col justify-center border-r-0 px-5 py-6 sm:px-8 sm:py-8 lg:max-w-[52%] lg:border-r lg:border-zinc-100 lg:py-10">
            <div className="flex items-center gap-2 text-[#F11E69]">
              <Lightbulb className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
              <p className="text-xs font-bold uppercase tracking-[0.14em]">Pro Tip</p>
            </div>
            <p className="mt-3 font-headline text-[28px] font-bold leading-snug text-[#111827] sm:text-xl">
              Boost engagement with <br/>Flash Sales
            </p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-[#6B7280]">
              Flash sales during 2 PM - 4 PM see an average <br/>of 34% higher conversion. Use the &quot;Quick <br/>Launch&quot;
              template to create a flash sale in <br/>under 60 seconds.
            </p>
            <button
              type="button"
              className="mt-6 w-full max-w-xs rounded-full border-2 border-[#F11E69] bg-white py-3 text-sm font-bold text-[#F11E69] transition hover:bg-[#F11E69]/5"
            >
              Explore Templates
            </button>
          </div>
          <ConversionPeakPanel />
        </div>
      </div>
    </div>
  );
}
