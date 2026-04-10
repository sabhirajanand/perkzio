import Card from '@/components/ui/card';
import DeleteStaffButton from '@/components/staff/DeleteStaffButton';
import EditStaffForm from '@/components/staff/EditStaffForm';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { getStaff, listRoles } from '@/lib/platform/platformServer';
import { readServerSession } from '@/lib/session/readServerSession';

export default async function StaffDetailPage({ params }: { params: Promise<{ staffId: string }> }) {
  const { staffId } = await params;
  const session = await readServerSession();
  const [detail, roles] = await Promise.all([getStaff(staffId), listRoles()]);
  const canDelete = hasPermission(session, AdminPermissions.ADMIN_USERS_DELETE);

  if (!detail) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">User not found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {detail.staff.fullName || detail.staff.email}
          </h1>
          <p className="mt-2 text-sm text-zinc-600">Update profile, status and role assignment.</p>
        </div>
        <DeleteStaffButton staffId={staffId} disabled={!canDelete} />
      </div>

      <Card className="rounded-[32px] p-6">
        <EditStaffForm staffId={staffId} initial={detail} roles={roles} />
      </Card>
    </div>
  );
}

