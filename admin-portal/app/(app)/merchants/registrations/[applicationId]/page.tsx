import Card from '@/components/ui/card';
import MerchantApplicationActions from '@/components/merchants/MerchantApplicationActions';
import MerchantRegistrationApplicationDetails from '@/components/merchants/MerchantRegistrationApplicationDetails';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { getMerchantApplication } from '@/lib/platform/platformServer';
import { readServerSession } from '@/lib/session/readServerSession';

export default async function MerchantRegistrationDetailPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;
  const session = await readServerSession();
  const canView = hasPermission(session, AdminPermissions.MERCHANT_APPLICATIONS_VIEW);
  const canReview = hasPermission(session, AdminPermissions.MERCHANT_APPLICATIONS_REVIEW);

  if (!canView) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">You do not have permission to view this application.</p>
      </Card>
    );
  }

  const json = await getMerchantApplication(applicationId);
  const application =
    json && typeof json === 'object' && 'application' in (json as object) ? (json as { application?: unknown }).application : null;

  if (!application || typeof application !== 'object') {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">Application not found</p>
      </Card>
    );
  }

  const a = application as Record<string, unknown>;
  const status = typeof a.status === 'string' ? a.status : '—';
  const referenceNumber = typeof a.referenceNumber === 'string' ? a.referenceNumber : '—';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Registration request</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Reference <span className="font-semibold text-zinc-900">{referenceNumber}</span> · Status{' '}
            <span className="font-semibold text-zinc-900">{status}</span>
          </p>
        </div>
        {status === 'SUBMITTED' ? <MerchantApplicationActions applicationId={applicationId} disabled={!canReview} /> : null}
      </div>

      <MerchantRegistrationApplicationDetails application={a} />
    </div>
  );
}
