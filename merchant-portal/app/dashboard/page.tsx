import KpiStrip from '@/components/dashboard/KpiStrip';
import EmailVerifyBanner from '@/components/dashboard/EmailVerifyBanner';
import SimpleBarChart from '@/components/dashboard/charts/SimpleBarChart';
import StampsLineChart from '@/components/dashboard/charts/StampsLineChart';
import Card from '@/components/ui/card';

const kpis = [
  { label: 'Stamps issued', value: '24,390', sublabel: 'Last 7 days' },
  { label: 'Active customers', value: '1,284', sublabel: 'With activity in period' },
  { label: 'New wallet adds', value: '312', sublabel: 'First-time adds' },
  { label: 'Reward redemptions', value: '184', sublabel: 'Stamp rewards claimed' },
  { label: 'Offer redemptions', value: '92', sublabel: 'Special offers redeemed' },
  { label: 'Campaign deliveries', value: '4,120', sublabel: 'Push / SMS / Email' },
] as const;

const stampsSeries = [
  { day: 'Mon', stamps: 1842 },
  { day: 'Tue', stamps: 2011 },
  { day: 'Wed', stamps: 1958 },
  { day: 'Thu', stamps: 2243 },
  { day: 'Fri', stamps: 2399 },
  { day: 'Sat', stamps: 2176 },
  { day: 'Sun', stamps: 1884 },
];

const byBranch = [
  { label: 'Head', value: 9200 },
  { label: 'Branch 2', value: 6100 },
  { label: 'Branch 3', value: 5090 },
];

const topOffers = [
  { title: '10% off on next visit', count: 48 },
  { title: 'Free dessert with bill ₹499+', count: 31 },
  { title: 'Buy 1 get 1 coffee', count: 22 },
  { title: '₹100 cashback on wallet add', count: 18 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="mt-2 text-sm font-medium text-[#4B5563]">Business performance — quick view and actions.</p>
        </div>

        <div className="flex items-center gap-2">
          <Card className="rounded-full bg-white px-5 py-3 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.30)] ring-1 ring-black/5">
            <p className="text-sm font-bold text-zinc-900">Last 7 days</p>
          </Card>
        </div>
      </div>

      <EmailVerifyBanner />

      <KpiStrip items={[...kpis]} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-[32px] bg-white p-6 shadow-[0_25px_50px_-40px_rgba(0,0,0,0.35)] ring-1 ring-black/5 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold tracking-tight text-zinc-900">Stamps over time</p>
              <p className="mt-1 text-sm font-medium text-[#4B5563]">Daily stamps issued</p>
            </div>
            <div className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white">Live view</div>
          </div>
          <div className="mt-6">
            <StampsLineChart data={stampsSeries} />
          </div>
        </Card>

        <Card className="rounded-[32px] bg-white p-6 shadow-[0_25px_50px_-40px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
          <p className="text-sm font-extrabold tracking-tight text-zinc-900">Operational alerts</p>
          <p className="mt-1 text-sm font-medium text-[#4B5563]">High-signal items</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-zinc-900">Subscription</p>
              <p className="mt-1 text-sm text-[#4B5563]">Renewal in 12 days</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-zinc-900">Limits</p>
              <p className="mt-1 text-sm text-[#4B5563]">Offers at 4/10 active</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-zinc-900">Campaigns</p>
              <p className="mt-1 text-sm text-[#4B5563]">2 scheduled today</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-[32px] bg-white p-6 shadow-[0_25px_50px_-40px_rgba(0,0,0,0.35)] ring-1 ring-black/5 lg:col-span-2">
          <p className="text-sm font-extrabold tracking-tight text-zinc-900">By branch</p>
          <p className="mt-1 text-sm font-medium text-[#4B5563]">Stamps distribution</p>
          <div className="mt-6">
            <SimpleBarChart data={byBranch} color="#111827" />
          </div>
        </Card>

        <Card className="rounded-[32px] bg-white p-6 shadow-[0_25px_50px_-40px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
          <p className="text-sm font-extrabold tracking-tight text-zinc-900">Top offers</p>
          <p className="mt-1 text-sm font-medium text-[#4B5563]">By redemptions</p>
          <div className="mt-6 divide-y divide-black/5">
            {topOffers.map((o) => (
              <div key={o.title} className="flex items-center justify-between gap-4 py-3">
                <p className="text-sm font-semibold text-zinc-900">{o.title}</p>
                <p className="text-sm font-extrabold text-zinc-900">{o.count}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
