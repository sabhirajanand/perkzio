import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils/cn';

type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

interface DayHours {
  day: DayKey;
  open: boolean;
  from: string;
  to: string;
}

const defaultHours: DayHours[] = [
  { day: 'Mon', open: true, from: '10:00', to: '20:00' },
  { day: 'Tue', open: true, from: '10:00', to: '20:00' },
  { day: 'Wed', open: true, from: '10:00', to: '20:00' },
  { day: 'Thu', open: true, from: '10:00', to: '20:00' },
  { day: 'Fri', open: true, from: '10:00', to: '20:00' },
  { day: 'Sat', open: true, from: '10:00', to: '20:00' },
  { day: 'Sun', open: false, from: '10:00', to: '20:00' },
];

export default function OperatingHoursCard() {
  const [hours, setHours] = useState<DayHours[]>(defaultHours);

  const dayLabel = useMemo<Record<DayKey, string>>(
    () => ({
      Mon: 'Mon',
      Tue: 'Tue',
      Wed: 'Wed',
      Thu: 'Thu',
      Fri: 'Fri',
      Sat: 'Sat',
      Sun: 'Sun',
    }),
    [],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {hours.map((row, idx) => (
          <div
            key={row.day}
            className="grid grid-cols-[60px_1fr_1fr_auto] items-center gap-x-3 gap-y-2"
          >
            <p className="text-base font-medium leading-6 text-[#011D35]">{dayLabel[row.day]}</p>

            <div className="flex items-center justify-end gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">From</span>
              <div className="w-[120px]">
                <input
                  type="time"
                  value={row.from}
                  disabled={!row.open}
                  onChange={(e) => {
                    const next = hours.slice();
                    next[idx] = { ...row, from: e.target.value };
                    setHours(next);
                  }}
                  className={cn(
                    'h-[55px] w-full rounded-full bg-[#F3F4F6] px-4 text-base text-zinc-900 outline-none ring-0',
                    'focus:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary/30',
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">To</span>
              <div className="w-[120px]">
                <input
                  type="time"
                  value={row.to}
                  disabled={!row.open}
                  onChange={(e) => {
                    const next = hours.slice();
                    next[idx] = { ...row, to: e.target.value };
                    setHours(next);
                  }}
                  className={cn(
                    'h-[55px] w-full rounded-full bg-[#F3F4F6] px-4 text-base text-zinc-900 outline-none ring-0',
                    'focus:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary/30',
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={row.open}
                onClick={() => {
                  const next = hours.slice();
                  next[idx] = { ...row, open: !row.open };
                  setHours(next);
                }}
                className={cn(
                  'relative h-5 w-9 shrink-0 rounded-full ring-1 transition-colors',
                  row.open ? 'bg-primary ring-primary' : 'bg-white ring-zinc-400',
                )}
              >
                <span
                  className={cn(
                    'absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow transition-all',
                    row.open ? 'left-[18px]' : 'left-[2px]',
                  )}
                >
                  <span
                    className={cn(
                      'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary transition-opacity',
                      row.open ? 'opacity-100' : 'opacity-0',
                    )}
                    aria-hidden
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </span>
                </span>
              </button>
              <p
                className={cn(
                  'min-w-[56px] text-sm font-semibold leading-none',
                  row.open ? 'text-[#011D35]' : 'text-zinc-400',
                )}
              >
                {row.open ? 'Open' : 'Closed'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

