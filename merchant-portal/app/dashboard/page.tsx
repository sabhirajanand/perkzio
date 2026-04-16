import ApprovalInProgressBanner from '@/components/dashboard/ApprovalInProgressBanner';
import DashboardChannelMix from '@/components/dashboard/DashboardChannelMix';
import DashboardPlanStrip from '@/components/dashboard/DashboardPlanStrip';
import DashboardRecentActivity from '@/components/dashboard/DashboardRecentActivity';
import EmailVerifyBanner from '@/components/dashboard/EmailVerifyBanner';
import KpiStrip from '@/components/dashboard/KpiStrip';
import StampsLineChart from '@/components/dashboard/charts/StampsLineChart';

const kpis = [
  {
    label: 'Stamps issued',
    value: '24,390',
    sublabel: 'Last 7 days',
    delta: '+12%',
    deltaVariant: 'up' as const,
  },
  {
    label: 'Active customers',
    value: '1,284',
    sublabel: 'With activity in period',
    delta: '+5%',
    deltaVariant: 'up' as const,
  },
  {
    label: 'Reward redemptions',
    value: '184',
    sublabel: 'Stamp rewards claimed',
    delta: '-2%',
    deltaVariant: 'down' as const,
  },
  {
    label: 'Special offer redemptions',
    value: '92',
    delta: '+18%',
    deltaVariant: 'up' as const,
  },
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

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6 space-y-4">
        <ApprovalInProgressBanner />
        <EmailVerifyBanner />
      </div>

      <KpiStrip items={[...kpis]} />

      <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="kinetic-shadow rounded-lg bg-surface-container-lowest p-10 lg:col-span-2">
          <div className="mb-10 flex items-center justify-between">
            <h4 className="font-headline text-xl font-bold">Stamps over time</h4>
            <select
              className="focus:ring-primary-brand/20 cursor-pointer rounded-full border-none bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface focus:ring-2 focus:outline-none"
              aria-label="Time range"
              defaultValue="30d"
            >
              <option value="30d">Last 30 Days</option>
              <option value="6m">Last 6 Months</option>
            </select>
          </div>
          <StampsLineChart data={stampsSeries} />
          <div className="text-outline mt-6 flex justify-between px-2 text-xs font-bold uppercase tracking-widest">
            <span>Sep 01</span>
            <span>Sep 08</span>
            <span>Sep 15</span>
            <span>Sep 22</span>
            <span>Sep 30</span>
          </div>
        </div>

        <DashboardChannelMix />
      </div>

      <DashboardRecentActivity />

      <DashboardPlanStrip />
    </div>
  );
}
