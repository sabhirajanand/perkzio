import Card from '@/components/ui/card';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { getBranchRequest } from '@/lib/platform/platformServer';
import { readServerSession } from '@/lib/session/readServerSession';
import BranchRegistrationActions from '@/components/merchants/BranchRegistrationActions';
import BranchRegistrationRequestDetails from '@/components/merchants/BranchRegistrationRequestDetails';

export default async function BranchRegistrationDetailPage({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  const session = await readServerSession();
  const canView = hasPermission(session, AdminPermissions.MERCHANTS_VIEW);
  const canEdit = hasPermission(session, AdminPermissions.MERCHANTS_EDIT);

  if (!canView) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">You do not have permission to view this request.</p>
      </Card>
    );
  }

  const detail = await getBranchRequest(requestId);
  if (!detail || !detail.request) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">Branch request not found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Branch registration request</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Status <span className="font-semibold text-zinc-900">{detail.request.status}</span> · Submitted{' '}
            <span className="font-semibold text-zinc-900">{new Date(detail.request.createdAt).toLocaleString()}</span>
          </p>
        </div>
        <div className="min-w-[260px]">
          <BranchRegistrationActions requestId={requestId} status={detail.request.status} disabled={!canEdit} />
        </div>
      </div>

      <BranchRegistrationRequestDetails detail={detail as unknown as Record<string, unknown>} />
    </div>
  );
}

