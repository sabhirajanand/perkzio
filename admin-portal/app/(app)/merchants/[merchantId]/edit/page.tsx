import Card from '@/components/ui/card';
import DeleteMerchantButton from '@/components/merchants/DeleteMerchantButton';
import EditMerchantForm from '@/components/merchants/EditMerchantForm';
import EditMerchantSubmissionForm from '@/components/merchants/EditMerchantSubmissionForm';
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
  const addr =
    m.registeredAddress && typeof m.registeredAddress === 'object'
      ? (m.registeredAddress as Record<string, unknown>)
      : null;
  const isSuperAdmin = session?.userType === 'SUPERADMIN';

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
            tradingName: m.tradingName,
            primaryBusinessEmail: m.primaryBusinessEmail,
            status: m.status,
            kycStatus: m.kycStatus,
            subscriptionLimitedMode: m.subscriptionLimitedMode,
            pan: m.pan,
            gstin: m.gstin,
            registeredAddress: {
              line1: typeof addr?.line1 === 'string' ? (addr.line1 as string) : '',
              city: typeof addr?.city === 'string' ? (addr.city as string) : '',
              state: typeof addr?.state === 'string' ? (addr.state as string) : '',
              pinCode: typeof addr?.pinCode === 'string' ? (addr.pinCode as string) : '',
            },
          }}
        />
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">Submission payload (from onboarding)</h2>
        <p className="text-sm text-zinc-600">
          Super admins can correct submission details even after approval. This updates the onboarding application payload.
        </p>
      </div>

      {detail.onboardingApplication && typeof detail.onboardingApplication === 'object' ? (
        <EditMerchantSubmissionForm
          applicationId={String((detail.onboardingApplication as { id?: unknown }).id)}
          initialBusinessPayload={
            (detail.onboardingApplication as { businessPayload?: unknown }).businessPayload &&
            typeof (detail.onboardingApplication as { businessPayload?: unknown }).businessPayload === 'object'
              ? ((detail.onboardingApplication as { businessPayload?: unknown }).businessPayload as Record<string, unknown>)
              : null
          }
          disabled={!isSuperAdmin}
        />
      ) : (
        <Card className="rounded-[32px] p-6">
          <p className="text-sm text-zinc-600">No onboarding application is linked to this merchant.</p>
        </Card>
      )}
    </div>
  );
}

