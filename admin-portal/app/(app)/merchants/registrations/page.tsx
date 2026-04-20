import Card from '@/components/ui/card';
import MerchantApplicationActions from '@/components/merchants/MerchantApplicationActions';
import Input from '@/components/ui/input';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { listMerchantApplicationsPage } from '@/lib/platform/platformServer';
import { readServerSession } from '@/lib/session/readServerSession';
import { merchantApplicationStatusLabel } from '@/lib/merchantApplications/statusLabel';
import { Search } from 'lucide-react';
import Link from 'next/link';

const PAGE_SIZE = 10;

function buildUrl(params: { q: string | null; planCode: string | null; createdFrom: string | null; createdTo: string | null; page: number }) {
  const p = new URLSearchParams();
  p.set('status', 'SUBMITTED');
  if (params.q) p.set('q', params.q);
  if (params.planCode) p.set('planCode', params.planCode);
  if (params.createdFrom) p.set('createdFrom', params.createdFrom);
  if (params.createdTo) p.set('createdTo', params.createdTo);
  if (params.page > 1) p.set('page', String(params.page));
  const s = p.toString();
  return `/merchants/registrations?${s}`;
}

export default async function MerchantRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; planCode?: string; createdFrom?: string; createdTo?: string; page?: string; status?: string }>;
}) {
  const session = await readServerSession();
  const canList = hasPermission(session, AdminPermissions.MERCHANT_APPLICATIONS_LIST);
  const canReview = hasPermission(session, AdminPermissions.MERCHANT_APPLICATIONS_REVIEW);
  const canEdit = hasPermission(session, AdminPermissions.MERCHANT_APPLICATIONS_EDIT);

  if (!canList) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">You do not have permission to view merchant registrations.</p>
      </Card>
    );
  }

  const sp = await searchParams;
  const q = typeof sp.q === 'string' && sp.q.trim() ? sp.q.trim() : null;
  const planCode = typeof sp.planCode === 'string' && sp.planCode.trim() ? sp.planCode.trim() : null;
  const createdFrom = typeof sp.createdFrom === 'string' && sp.createdFrom.trim() ? sp.createdFrom.trim() : null;
  const createdTo = typeof sp.createdTo === 'string' && sp.createdTo.trim() ? sp.createdTo.trim() : null;
  const pageRaw = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const result = await listMerchantApplicationsPage({
    status: 'SUBMITTED',
    q,
    planCode,
    createdFrom,
    createdTo,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  const applications = result.applications;
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const from = result.total > 0 ? result.offset + 1 : 0;
  const to = result.total > 0 ? Math.min(result.offset + applications.length, result.total) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Merchant registrations</h1>
        <p className="mt-2 text-sm text-zinc-600">Pending merchant admin registrations awaiting approval.</p>
      </div>

      <Card className="rounded-[32px] p-6">
        <form method="get" action="/merchants/registrations" className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input type="hidden" name="status" value="SUBMITTED" />
          <input type="hidden" name="page" value="1" />
          <div className="min-w-0 flex-1">
            <Input
              name="q"
              defaultValue={q ?? ''}
              placeholder="Search by reference, business, email, phone"
              leadingIcon={<Search className="h-5 w-5 text-zinc-600" strokeWidth={2} aria-hidden />}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              name="planCode"
              defaultValue={planCode ?? ''}
              className="h-[55px] rounded-full bg-[#F3F4F6] px-6 text-sm font-semibold text-zinc-800 outline-none ring-0 focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All plans</option>
              <option value="LITE">LITE</option>
              <option value="GROWTH">GROWTH</option>
              <option value="PRO">PRO</option>
            </select>
            <input
              type="date"
              name="createdFrom"
              defaultValue={createdFrom ?? ''}
              className="h-[55px] rounded-full bg-[#F3F4F6] px-6 text-sm font-semibold text-zinc-800 outline-none ring-0 focus:ring-2 focus:ring-primary/30"
              aria-label="Created from"
            />
            <input
              type="date"
              name="createdTo"
              defaultValue={createdTo ?? ''}
              className="h-[55px] rounded-full bg-[#F3F4F6] px-6 text-sm font-semibold text-zinc-800 outline-none ring-0 focus:ring-2 focus:ring-primary/30"
              aria-label="Created to"
            />
            <button
              type="submit"
              className="h-[55px] rounded-full bg-gradient-to-r from-[#F11E69] to-[#FF4FA3] px-10 text-sm font-bold text-white shadow-[0_10px_40px_-10px_rgba(241,30,105,0.4)] transition hover:brightness-95"
            >
              Search
            </button>
          </div>
        </form>
      </Card>

      <Card className="rounded-[32px] p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-separate border-spacing-y-2 text-left text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-2">Reference</th>
                <th className="px-4 py-2">Business</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Outlets</th>
                <th className="px-4 py-2">Plan</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Submitted</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id} className="rounded-2xl bg-white ring-1 ring-black/5">
                  <td className="px-4 py-3 font-semibold text-zinc-900">
                    <Link className="hover:underline" href={`/merchants/registrations/${a.id}`}>
                      {a.referenceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{a.businessName || '—'}</td>
                  <td className="px-4 py-3 text-zinc-700">{a.contactEmail || '—'}</td>
                  <td className="px-4 py-3 text-zinc-700">{a.contactPhone || '—'}</td>
                  <td className="px-4 py-3 text-zinc-700">{a.outletsCount != null ? String(a.outletsCount) : '—'}</td>
                  <td className="px-4 py-3 text-zinc-700">{a.plan || '—'}</td>
                  <td className="px-4 py-3 text-zinc-700">{merchantApplicationStatusLabel(a.status)}</td>
                  <td className="px-4 py-3 text-zinc-700">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href={`/merchants/registrations/${a.id}`}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50"
                      >
                        View
                      </Link>
                      <Link
                        href={`/merchants/registrations/${a.id}/edit`}
                        aria-disabled={!canEdit}
                        className={
                          canEdit
                            ? 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50'
                            : 'pointer-events-none rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-400 ring-1 ring-black/5 opacity-60'
                        }
                      >
                        Edit
                      </Link>
                      {a.status === 'SUBMITTED' ? <MerchantApplicationActions applicationId={a.id} disabled={!canReview} /> : null}
                    </div>
                  </td>
                </tr>
              ))}
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-sm text-zinc-600">
                    No applications found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="rounded-[32px] p-6">
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-zinc-600">
            Showing <span className="text-zinc-900">{from}–{to}</span> of <span className="text-zinc-900">{result.total}</span>
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-2 sm:justify-end" aria-label="Pagination">
            <Link
              href={page > 1 ? buildUrl({ q, planCode, createdFrom, createdTo, page: page - 1 }) : '#'}
              aria-disabled={page <= 1}
              className={
                page > 1
                  ? 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50'
                  : 'pointer-events-none rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-400 ring-1 ring-black/5 opacity-60'
              }
            >
              Prev
            </Link>
            <span className="text-sm font-semibold text-zinc-700">
              Page {page} of {totalPages}
            </span>
            <Link
              href={page < totalPages ? buildUrl({ q, planCode, createdFrom, createdTo, page: page + 1 }) : '#'}
              aria-disabled={page >= totalPages}
              className={
                page < totalPages
                  ? 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50'
                  : 'pointer-events-none rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-400 ring-1 ring-black/5 opacity-60'
              }
            >
              Next
            </Link>
          </nav>
        </div>
      </Card>
    </div>
  );
}

