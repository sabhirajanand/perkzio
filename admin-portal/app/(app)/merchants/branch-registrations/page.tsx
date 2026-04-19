import BranchRegistrationsWorkspace from '@/components/merchants/BranchRegistrationsWorkspace';
import Card from '@/components/ui/card';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { readServerSession } from '@/lib/session/readServerSession';

export default async function BranchRegistrationsPage() {
  const session = await readServerSession();
  const canView = hasPermission(session, AdminPermissions.MERCHANTS_VIEW);
  const canEdit = hasPermission(session, AdminPermissions.MERCHANTS_EDIT);

  if (!canView) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">You do not have permission to view branch registrations.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Branch registrations</h1>
        <p className="mt-2 text-sm text-zinc-600">
          All requests submitted by merchant admins to add a new branch. Approve to provision the branch and activate the
          Branch Admin. Reject to keep it unprovisioned.
        </p>
      </div>

      <BranchRegistrationsWorkspace canEdit={canEdit} />
    </div>
  );
}

