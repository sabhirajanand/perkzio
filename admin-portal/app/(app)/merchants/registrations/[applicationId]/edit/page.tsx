import Card from '@/components/ui/card';
import EditMerchantApplicationForm from '@/components/merchants/EditMerchantApplicationForm';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { getMerchantApplication } from '@/lib/platform/platformServer';
import { readServerSession } from '@/lib/session/readServerSession';

export default async function EditMerchantRegistrationPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;
  const session = await readServerSession();
  const canEdit = hasPermission(session, AdminPermissions.MERCHANT_APPLICATIONS_EDIT);
  if (!canEdit) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">You do not have permission to edit applications.</p>
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
  if (status !== 'SUBMITTED' && status !== 'PAYMENT_PENDING') {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">Only pending applications can be edited.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Edit registration request</h1>
        <p className="mt-2 text-sm text-zinc-600">Update the application details before approval.</p>
      </div>

      <Card className="rounded-[32px] p-6">
        <EditMerchantApplicationForm applicationId={applicationId} initial={a} />
      </Card>
    </div>
  );
}

