import Card from '@/components/ui/card';
import MerchantApplicationActions from '@/components/merchants/MerchantApplicationActions';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { listMerchantApplications } from '@/lib/platform/platformServer';
import { readServerSession } from '@/lib/session/readServerSession';
import { merchantApplicationStatusLabel } from '@/lib/merchantApplications/statusLabel';
import Link from 'next/link';

export default async function MerchantRegistrationsPage() {
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

  const applications = await listMerchantApplications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Merchant registrations</h1>
        <p className="mt-2 text-sm text-zinc-600">All registration requests. Review submitted applications and approve or reject.</p>
      </div>

      <Card className="rounded-[32px] p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-2">Reference</th>
                <th className="px-4 py-2">Business</th>
                <th className="px-4 py-2">Email</th>
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
                  <td className="px-4 py-3 text-zinc-700">{a.plan || '—'}</td>
                  <td className="px-4 py-3 text-zinc-700">{merchantApplicationStatusLabel(a.status)}</td>
                  <td className="px-4 py-3 text-zinc-700">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href={`/merchants/registrations/${a.id}`}
                        className="rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50"
                      >
                        View
                      </Link>
                      <Link
                        href={`/merchants/registrations/${a.id}/edit`}
                        aria-disabled={!canEdit}
                        className={
                          canEdit
                            ? 'rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50'
                            : 'pointer-events-none rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-400 ring-1 ring-black/5 opacity-60'
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
                  <td colSpan={7} className="px-4 py-6 text-sm text-zinc-600">
                    No applications found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

