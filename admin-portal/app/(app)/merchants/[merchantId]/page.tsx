import Link from 'next/link';

import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { getMerchant } from '@/lib/platform/platformServer';
import { readServerSession } from '@/lib/session/readServerSession';

export default async function MerchantViewPage({ params }: { params: Promise<{ merchantId: string }> }) {
  const { merchantId } = await params;
  const session = await readServerSession();
  const canView = hasPermission(session, AdminPermissions.MERCHANTS_VIEW);
  const canEdit = hasPermission(session, AdminPermissions.MERCHANTS_EDIT);

  if (!canView) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">You do not have permission to view merchants.</p>
      </Card>
    );
  }

  const detail = await getMerchant(merchantId);
  if (!detail) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">Merchant not found</p>
      </Card>
    );
  }

  const m = detail.merchant;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{m.legalName}</h1>
          <p className="mt-2 text-sm text-zinc-600">Read-only merchant profile.</p>
        </div>
        {canEdit ? (
          <Link href={`/merchants/${merchantId}/edit`}>
            <Button>Edit</Button>
          </Link>
        ) : null}
      </div>

      <Card className="rounded-[32px] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Status</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{m.status}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">KYC status</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{m.kycStatus}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Primary email</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{m.primaryBusinessEmail || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Subscription limited mode</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{m.subscriptionLimitedMode ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

