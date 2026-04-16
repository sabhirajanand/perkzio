import { Gift, Megaphone, Star, Ticket, Users, Wallet } from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

export interface KpiItem {
  label: string;
  value: string;
  sublabel?: string;
  delta?: string;
  deltaVariant?: 'up' | 'down' | 'neutral';
}

export interface KpiStripProps {
  items: KpiItem[];
}

const iconCycle: LucideIcon[] = [Ticket, Users, Gift, Star, Wallet, Megaphone];

const iconStyles = [
  'text-primary-brand bg-primary-fixed-dim/20',
  'text-secondary-brand bg-secondary-fixed-dim/20',
  'text-[#6049b3] bg-tertiary-fixed-dim/20',
  'text-primary-brand bg-on-primary/30',
  'text-primary-brand bg-primary-fixed-dim/20',
  'text-secondary-brand bg-secondary-fixed-dim/20',
];

function DeltaBadge({ delta, variant }: { delta: string; variant: KpiItem['deltaVariant'] }) {
  const v = variant ?? 'neutral';
  const cls =
    v === 'up'
      ? 'text-emerald-500 bg-emerald-50'
      : v === 'down'
        ? 'text-rose-500 bg-rose-50'
        : 'text-on-surface-variant bg-surface-container-low';
  return <span className={`text-xs font-black ${cls} rounded-full px-2 py-1`}>{delta}</span>;
}

export default function KpiStrip({ items }: KpiStripProps) {
  return (
    <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-4">
      {items.map((k, idx) => {
        const Icon = iconCycle[idx % iconCycle.length];
        const iconClass = iconStyles[idx % iconStyles.length];
        return (
          <div
            key={k.label}
            className="group kinetic-shadow rounded-lg bg-surface-container-lowest p-8 transition-transform hover:-translate-y-1"
          >
            <div className="mb-6 flex items-start justify-between">
              <span className={`inline-flex rounded-full p-3 ${iconClass}`}>
                <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </span>
              {k.delta ? <DeltaBadge delta={k.delta} variant={k.deltaVariant} /> : null}
            </div>
            <p className="text-outline mb-1 text-[10px] font-bold uppercase tracking-[0.1em]">{k.label}</p>
            <p className="font-headline text-4xl font-extrabold text-on-surface">{k.value}</p>
            {k.sublabel ? <p className="mt-2 text-sm font-medium text-on-surface-variant">{k.sublabel}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
