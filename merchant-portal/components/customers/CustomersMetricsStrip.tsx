import { BadgeCheck, UserRoundCheck } from 'lucide-react';

/**
 * Bottom insight cards from Figma (Customers) — static presentation metrics.
 */
export default function CustomersMetricsStrip() {
  return (
    <section
      className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5"
      aria-label="Customer insights"
    >
      <div className="flex flex-col rounded-[24px] border border-[#B3B1B4]/10 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)] lg:col-span-3">
        <UserRoundCheck
          className="mb-4 h-8 w-8 text-[#3B82F6]"
          strokeWidth={1.5}
          aria-hidden
        />
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#605E61]">
          Availability
        </p>
        <p className="mt-2 font-headline text-4xl font-bold tracking-tight text-[#333235]">92%</p>
        <p className="mt-2 text-sm leading-snug text-[#6B7280]">
          Currently assigned to active projects
        </p>
      </div>

      <div className="flex flex-col rounded-[24px] border border-[#B3B1B4]/10 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)] lg:col-span-3">
        <BadgeCheck className="mb-4 h-8 w-8 text-[#3B82F6]" strokeWidth={1.5} aria-hidden />
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#605E61]">
          Compliance
        </p>
        <p className="mt-2 font-headline text-4xl font-bold tracking-tight text-[#333235]">100%</p>
        <p className="mt-2 text-sm leading-snug text-[#6B7280]">Safety certifications up to date</p>
      </div>

      <div className="relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-[24px] border border-black/10 bg-gradient-to-br from-[#2d2d32] via-[#3a3a42] to-[#5c5c66] p-6 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] lg:col-span-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#F11E69]">
            Growth momentum
          </p>
          <p className="mt-3 font-headline text-2xl font-bold leading-tight text-[#FF4FA3] sm:text-[26px]">
            +14 Hires this quarter
          </p>
        </div>
        <div className="mt-6 flex items-end justify-between gap-4">
          <div className="flex -space-x-2">
            {['#93C5FD', '#A5B4FC', '#C4B5FD'].map((bg, i) => (
              <div
                key={i}
                className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border-2 border-white shadow-sm"
                style={{ backgroundColor: bg }}
                aria-hidden
              />
            ))}
            <div className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#F11E69] text-xs font-bold text-white shadow-sm">
              +11
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
