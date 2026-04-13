import Card from '@/components/ui/card';
import DeleteMerchantButton from '@/components/merchants/DeleteMerchantButton';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { listMerchants } from '@/lib/platform/platformServer';
import { readServerSession } from '@/lib/session/readServerSession';
import Link from 'next/link';

export default async function MerchantsPage() {
  const session = await readServerSession();
  const canList = hasPermission(session, AdminPermissions.MERCHANTS_LIST);
  const canView = hasPermission(session, AdminPermissions.MERCHANTS_VIEW);
  const canEdit = hasPermission(session, AdminPermissions.MERCHANTS_EDIT);
  const canDelete = hasPermission(session, AdminPermissions.MERCHANTS_DELETE);
  if (!canList) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">You do not have permission to view merchants.</p>
      </Card>
    );
  }

  const merchants = await listMerchants();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Merchants</h1>
        <p className="mt-2 text-sm text-zinc-600">All onboarded merchants across the platform.</p>
      </div>

      <Card className="rounded-[32px] p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-2">Merchant</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">KYC</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m) => (
                <tr key={m.id} className="rounded-2xl bg-white ring-1 ring-black/5">
                  <td className="px-4 py-3 font-semibold text-zinc-900">{m.legalName}</td>
                  <td className="px-4 py-3 text-zinc-700">{m.primaryBusinessEmail || '—'}</td>
                  <td className="px-4 py-3 text-zinc-700">{m.status}</td>
                  <td className="px-4 py-3 text-zinc-700">{m.kycStatus}</td>
                  <td className="px-4 py-3 text-zinc-700">{new Date(m.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href={canView ? `/merchants/${m.id}` : '#'}
                        aria-disabled={!canView}
                        className={
                          canView
                            ? 'rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50'
                            : 'pointer-events-none rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-400 ring-1 ring-black/5 opacity-60'
                        }
                      >
                        View
                      </Link>
                      <Link
                        href={canEdit ? `/merchants/${m.id}/edit` : '#'}
                        aria-disabled={!canEdit}
                        className={
                          canEdit
                            ? 'rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50'
                            : 'pointer-events-none rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-400 ring-1 ring-black/5 opacity-60'
                        }
                      >
                        Edit
                      </Link>
                      <DeleteMerchantButton merchantId={m.id} disabled={!canDelete} />
                    </div>
                  </td>
                </tr>
              ))}
              {merchants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-sm text-zinc-600">
                    No merchants found.
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

