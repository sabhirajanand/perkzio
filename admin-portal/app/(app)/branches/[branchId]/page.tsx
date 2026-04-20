import Link from 'next/link';

import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import BranchRegistrationOutletPreview from '@/components/merchants/BranchRegistrationOutletPreview';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { getBranch } from '@/lib/platform/platformServer';
import { readServerSession } from '@/lib/session/readServerSession';

export default async function BranchViewPage({ params }: { params: Promise<{ branchId: string }> }) {
  const { branchId } = await params;
  const session = await readServerSession();
  const canView = hasPermission(session, AdminPermissions.MERCHANTS_VIEW);

  if (!canView) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">You do not have permission to view branches.</p>
      </Card>
    );
  }

  const detail = await getBranch(branchId);
  if (!detail) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">Branch not found</p>
      </Card>
    );
  }

  const b = detail.branch;
  const req = detail.branchRequest;
  const payload =
    req?.payload && typeof req.payload === 'object' ? (req.payload as Record<string, unknown>) : null;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{b.name}</h1>
          <p className="mt-2 text-sm text-zinc-600">
            {b.merchant?.id ? (
              <>
                Merchant:{' '}
                <Link className="font-semibold text-zinc-900 hover:underline" href={`/merchants/${b.merchant.id}`}>
                  {b.merchant.legalName}
                </Link>
              </>
            ) : (
              'Merchant: —'
            )}
          </p>
        </div>
        {b.merchant?.id ? (
          <Link href={`/merchants/${b.merchant.id}/edit`}>
            <Button>Edit merchant</Button>
          </Link>
        ) : null}
      </div>

      <Card className="rounded-[32px] p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-zinc-500">Status</dt>
            <dd className="mt-1 text-sm font-semibold text-zinc-900">{b.status || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-zinc-500">Plan</dt>
            <dd className="mt-1 text-sm font-semibold text-zinc-900">{b.plan?.name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-zinc-500">Admin email</dt>
            <dd className="mt-1 text-sm font-semibold text-zinc-900">{b.adminEmail ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-zinc-500">Created</dt>
            <dd className="mt-1 text-sm font-semibold text-zinc-900">{b.createdAt ? new Date(b.createdAt).toLocaleString() : '—'}</dd>
          </div>
        </dl>
      </Card>

      <Card className="rounded-[32px] p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Branch request (submitted by merchant admin)</h2>
        {req ? (
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-zinc-500">Request status</dt>
              <dd className="mt-1 text-sm font-semibold text-zinc-900">{req.status}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-zinc-500">Requested branch name</dt>
              <dd className="mt-1 text-sm font-semibold text-zinc-900">{req.branchName}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-zinc-500">Requested admin</dt>
              <dd className="mt-1 text-sm font-semibold text-zinc-900">{req.adminName ?? '—'}</dd>
              <dd className="mt-1 text-sm text-zinc-700">{req.adminEmail}</dd>
              <dd className="mt-1 text-sm text-zinc-700">{req.adminPhone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-zinc-500">Submitted</dt>
              <dd className="mt-1 text-sm font-semibold text-zinc-900">
                {req.createdAt ? new Date(req.createdAt).toLocaleString() : '—'}
              </dd>
              <dt className="mt-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Reviewed</dt>
              <dd className="mt-1 text-sm font-semibold text-zinc-900">
                {req.reviewedAt ? new Date(req.reviewedAt).toLocaleString() : '—'}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-zinc-600">No linked request was found for this branch.</p>
        )}
      </Card>

      {payload ? (
        <Card className="rounded-[32px] p-6">
          <h2 className="text-sm font-semibold text-zinc-900">Outlet details (from request payload)</h2>
          <div className="mt-4">
            <BranchRegistrationOutletPreview payload={payload} />
          </div>
        </Card>
      ) : null}
    </div>
  );
}

