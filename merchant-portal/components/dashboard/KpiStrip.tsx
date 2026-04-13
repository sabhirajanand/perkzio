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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((k, idx) => (
        <Card
          key={k.label}
          className={[
            'rounded-[32px] bg-white px-7 py-6 shadow-[0_25px_50px_-40px_rgba(0,0,0,0.35)]',
            idx === 0 ? 'border border-[#F11E69]' : 'border border-black/5',
          ].join(' ')}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#4B5563]">{k.label}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900">{k.value}</p>
          {k.sublabel ? <p className="mt-2 text-sm font-medium text-[#4B5563]">{k.sublabel}</p> : null}
        </Card>
      ))}
    </div>
  );
}

