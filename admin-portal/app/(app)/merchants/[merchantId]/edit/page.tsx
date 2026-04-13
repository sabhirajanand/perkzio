import Card from '@/components/ui/card';
import DeleteMerchantButton from '@/components/merchants/DeleteMerchantButton';
import EditMerchantForm from '@/components/merchants/EditMerchantForm';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { getMerchant } from '@/lib/platform/platformServer';
import { readServerSession } from '@/lib/session/readServerSession';

export default async function MerchantEditPage({ params }: { params: Promise<{ merchantId: string }> }) {
  const { merchantId } = await params;
  const session = await readServerSession();
  const canEdit = hasPermission(session, AdminPermissions.MERCHANTS_EDIT);
  const canDelete = hasPermission(session, AdminPermissions.MERCHANTS_DELETE);

  if (!canEdit) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">You do not have permission to edit merchants.</p>
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
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Edit merchant</h1>
          <p className="mt-2 text-sm text-zinc-600">Update merchant details and status.</p>
        </div>
        <DeleteMerchantButton merchantId={merchantId} disabled={!canDelete} />
      </div>

      <Card className="rounded-[32px] p-6">
        <EditMerchantForm
          merchantId={merchantId}
          initial={{
            legalName: m.legalName,
            primaryBusinessEmail: m.primaryBusinessEmail,
            status: m.status,
            kycStatus: m.kycStatus,
          }}
        />
      </Card>
    </div>
  );
}

