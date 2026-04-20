import ApplicationsFunnelBarChart from '@/components/dashboard/charts/ApplicationsFunnelBarChart';
import MerchantsByPlanDonut from '@/components/dashboard/charts/MerchantsByPlanDonut';
import StampsLineChart from '@/components/dashboard/charts/StampsLineChart';
import KpiStrip from '@/components/dashboard/KpiStrip';
import MerchantApplicationActions from '@/components/merchants/MerchantApplicationActions';
import Card from '@/components/ui/card';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { listMerchantApplicationsPage } from '@/lib/platform/platformServer';
import { readServerSession } from '@/lib/session/readServerSession';

const kpis = [
  { label: 'Active merchants', value: '1,284', sublabel: 'Subscription active + KYC approved' },
  { label: 'Pending applications', value: '37', sublabel: 'Awaiting review' },
  { label: 'MRR', value: '₹18.6L', sublabel: 'Estimated' },
  { label: 'Open tickets', value: '142', sublabel: 'Across merchant + customer' },
] as const;

const stampsSeries = [
  { day: 'Mon', stamps: 18420 },
  { day: 'Tue', stamps: 20110 },
  { day: 'Wed', stamps: 19580 },
  { day: 'Thu', stamps: 22430 },
  { day: 'Fri', stamps: 23990 },
  { day: 'Sat', stamps: 21760 },
  { day: 'Sun', stamps: 18840 },
];

const funnel = [
  { stage: 'Submitted', count: 520 },
  { stage: 'Approved', count: 312 },
  { stage: 'Activated', count: 241 },
];

const planMix = [
  { name: 'Lite', value: 512, color: '#111827' },
  { name: 'Growth', value: 672, color: '#F11E69' },
  { name: 'Pro', value: 100, color: '#F59E0B' },
];

export default async function DashboardPage() {
  const session = await readServerSession();
  const canListApps = hasPermission(session, AdminPermissions.MERCHANT_APPLICATIONS_LIST);
  const canReviewApps = hasPermission(session, AdminPermissions.MERCHANT_APPLICATIONS_REVIEW);
  const applicationsResult = canListApps
    ? await listMerchantApplicationsPage({ status: 'SUBMITTED', limit: 10, offset: 0 })
    : { ok: true as const, total: 0, limit: 10, offset: 0, applications: [] };
  const applications = applicationsResult.applications;
  const pendingCount = applicationsResult.total;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Platform command centre — health, growth, risk, and queues.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-700 ring-1 ring-black/5">
            Region: IST
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-700 ring-1 ring-black/5">
            Last 7 days
          </div>
        </div>
      </div>

      <KpiStrip
        items={[
          kpis[0],
          { ...kpis[1], value: pendingCount.toString() },
          kpis[2],
          kpis[3],
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-[32px] p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Stamps (platform)</p>
              <p className="mt-1 text-sm text-zinc-600">Total stamp events in period</p>
            </div>
            <div className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white">
              Validation mix ready
            </div>
          </div>
          <div className="mt-6">
            <StampsLineChart data={stampsSeries} />
          </div>
        </Card>

        <Card className="rounded-[32px] p-6">
          <p className="text-sm font-semibold text-zinc-900">Merchants by plan</p>
          <p className="mt-1 text-sm text-zinc-600">Lite / Growth / Pro</p>
          <div className="mt-6">
            <MerchantsByPlanDonut data={planMix} />
          </div>
          <div className="mt-4 space-y-2">
            {planMix.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                    aria-hidden
                  />
                  <span className="font-semibold text-zinc-700">{p.name}</span>
                </div>
                <span className="font-semibold text-zinc-900">{p.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-[32px] p-6 lg:col-span-2">
          <p className="text-sm font-semibold text-zinc-900">Merchant applications funnel</p>
          <p className="mt-1 text-sm text-zinc-600">Submitted → approved → activated</p>
          <div className="mt-6">
            <ApplicationsFunnelBarChart data={funnel} />
          </div>
        </Card>

        <Card className="rounded-[32px] p-6">
          <p className="text-sm font-semibold text-zinc-900">Operational alerts</p>
          <p className="mt-1 text-sm text-zinc-600">High-signal queues</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-zinc-900">Ticket SLA breach</p>
              <p className="mt-1 text-sm text-zinc-600">12 tickets over SLA (by tier)</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-zinc-900">Sync backlog</p>
              <p className="mt-1 text-sm text-zinc-600">3 devices with pending queue &gt; 500</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-zinc-900">Failed payments</p>
              <p className="mt-1 text-sm text-zinc-600">8 merchants in dunning</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-zinc-900">CMS banners</p>
              <p className="mt-1 text-sm text-zinc-600">2 active hero banners</p>
            </div>
          </div>
        </Card>
      </div>

      {canListApps ? (
        <Card className="rounded-[32px] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Merchant registration requests</p>
              <p className="mt-1 text-sm text-zinc-600">Latest submitted applications awaiting review</p>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-700 ring-1 ring-black/5">
              {pendingCount} pending
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-2">Reference</th>
                  <th className="px-4 py-2">Business</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Plan</th>
                  <th className="px-4 py-2">Submitted</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 10).map((a) => (
                  <tr key={a.id} className="rounded-2xl bg-white ring-1 ring-black/5">
                    <td className="px-4 py-3 font-semibold text-zinc-900">{a.referenceNumber}</td>
                    <td className="px-4 py-3 text-zinc-700">{a.businessName || '—'}</td>
                    <td className="px-4 py-3 text-zinc-700">{a.contactEmail || '—'}</td>
                    <td className="px-4 py-3 text-zinc-700">{a.plan || '—'}</td>
                    <td className="px-4 py-3 text-zinc-700">{new Date(a.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <MerchantApplicationActions applicationId={a.id} disabled={!canReviewApps} />
                    </td>
                  </tr>
                ))}
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-sm text-zinc-600">
                      No pending applications right now.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

