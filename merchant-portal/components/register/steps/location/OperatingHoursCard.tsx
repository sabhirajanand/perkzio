import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils/cn';

type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

interface DayHours {
  day: DayKey;
  open: boolean;
}

const defaultHours: DayHours[] = [
  { day: 'Mon', open: true },
  { day: 'Tue', open: true },
  { day: 'Wed', open: true },
  { day: 'Thu', open: true },
  { day: 'Fri', open: true },
  { day: 'Sat', open: true },
  { day: 'Sun', open: false },
];

export default function OperatingHoursCard() {
  const [hours, setHours] = useState<DayHours[]>(defaultHours);

  const dayLabel = useMemo<Record<DayKey, string>>(
    () => ({
      Mon: 'Monday',
      Tue: 'Tuesday',
      Wed: 'Wednesday',
      Thu: 'Thursday',
      Fri: 'Friday',
      Sat: 'Saturday',
      Sun: 'Sunday',
    }),
    [],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {hours.map((row, idx) => (
          <div key={row.day} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-base font-medium leading-6 text-[#011D35]">{dayLabel[row.day]}</p>
            </div>

            <div className="flex items-baseline gap-3">
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
                  'relative h-5 w-9 rounded-full ring-1 transition-colors',
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
              <p className={cn('text-sm font-semibold leading-none', row.open ? 'text-[#011D35]' : 'text-zinc-400')}>
                {row.open ? 'Open' : 'Closed'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

