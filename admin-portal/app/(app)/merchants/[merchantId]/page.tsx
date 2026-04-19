import Link from 'next/link';

import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import MerchantApprovedProfileDetails from '@/components/merchants/MerchantApprovedProfileDetails';
import MerchantBranchRequestsPanel from '@/components/merchants/MerchantBranchRequestsPanel';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { getMerchant, listMerchantBranchRequests } from '@/lib/platform/platformServer';
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

  const [detail, branchRequests] = await Promise.all([
    getMerchant(merchantId),
    canView ? listMerchantBranchRequests(merchantId) : Promise.resolve([]),
  ]);
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
          <p className="mt-2 text-sm text-zinc-600">
            Account, branch, and onboarding snapshot (including legacy fields stored on the application).
          </p>
        </div>
        {canEdit ? (
          <Link href={`/merchants/${merchantId}/edit`}>
            <Button>Edit</Button>
          </Link>
        ) : null}
      </div>

      <MerchantApprovedProfileDetails detail={detail} />

      {canView ? (
        <MerchantBranchRequestsPanel merchantId={merchantId} requests={branchRequests} canEdit={canEdit} />
      ) : null}
    </div>
  );
}
