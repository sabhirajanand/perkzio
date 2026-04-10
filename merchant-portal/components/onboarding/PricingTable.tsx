import { pricing } from '@/lib/pricing';

export default function PricingTable() {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-zinc-900">Plans</div>
      <div className="text-xs font-semibold text-zinc-600">{pricing.gstNote}</div>
      <div className="grid gap-3 md:grid-cols-3">
        {pricing.plans.map((p) => (
          <div key={p.code} className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5">
            <div className="text-sm font-semibold text-zinc-900">{p.title}</div>
            <div className="mt-2 text-sm font-semibold text-zinc-900">{p.priceMonthly}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

