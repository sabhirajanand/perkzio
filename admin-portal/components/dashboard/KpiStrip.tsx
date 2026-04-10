import Card from '@/components/ui/card';

export interface KpiItem {
  label: string;
  value: string;
  sublabel?: string;
}

export interface KpiStripProps {
  items: KpiItem[];
}

export default function KpiStrip({ items }: KpiStripProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((k, idx) => (
        <Card
          key={k.label}
          className={[
            'rounded-[32px] p-6',
            idx === 0 ? 'ring-primary/40 border border-primary' : '',
          ].join(' ')}
        >
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-600">{k.label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">{k.value}</p>
          {k.sublabel ? <p className="mt-2 text-sm text-zinc-600">{k.sublabel}</p> : null}
        </Card>
      ))}
    </div>
  );
}

