import { useMemo, useState } from 'react';
import Select from '@/components/ui/Select';
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

function to12HourLabel(value: string) {
  const m = value.match(/^(\d{2}):(\d{2})$/);
  if (!m) return value;
  const hh = Number(m[1]);
  const mm = m[2];
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${mm} ${ampm}`;
}

function makeTimeOptions(stepMinutes = 30) {
  const options: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h += 1) {
    for (let m = 0; m < 60; m += stepMinutes) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      const v = `${hh}:${mm}`;
      options.push({ value: v, label: to12HourLabel(v) });
    }
  }
  return options;
}

const TIME_OPTIONS = makeTimeOptions(30);

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
    <div className="space-y-3">
      <div className="grid gap-3">
        {hours.map((row, idx) => (
          <div key={row.day} className="rounded-2xl border border-black/10 bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <p className="text-[15px] font-extrabold text-[#011D35]">{dayLabel[row.day]}</p>
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
                    'relative h-6 w-11 shrink-0 rounded-full ring-1 transition-colors',
                    row.open ? 'bg-primary ring-primary' : 'bg-white ring-zinc-400',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-all',
                      row.open ? 'left-[22px]' : 'left-[2px]',
                    )}
                  />
                </button>
                <p
                  className={cn(
                    'w-[56px] text-right text-sm font-semibold',
                    row.open ? 'text-[#011D35]' : 'text-zinc-400',
                  )}
                >
                  {row.open ? 'Open' : 'Closed'}
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <span className="sr-only">From</span>
                <Select
                  value={row.from}
                  onValueChange={(v) => {
                    const next = hours.slice();
                    next[idx] = { ...row, from: v };
                    setHours(next);
                  }}
                  options={TIME_OPTIONS}
                  placeholder="From"
                  disabled={!row.open}
                  className="[&_button]:h-10 [&_button]:rounded-full [&_button]:bg-[#F3F4F6] [&_button]:px-4 [&_button_span]:text-[15px]"
                />
              </div>
              <div>
                <span className="sr-only">To</span>
                <Select
                  value={row.to}
                  onValueChange={(v) => {
                    const next = hours.slice();
                    next[idx] = { ...row, to: v };
                    setHours(next);
                  }}
                  options={TIME_OPTIONS}
                  placeholder="To"
                  disabled={!row.open}
                  className="[&_button]:h-10 [&_button]:rounded-full [&_button]:bg-[#F3F4F6] [&_button]:px-4 [&_button_span]:text-[15px]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

