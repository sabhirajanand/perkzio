import Card from '@/components/ui/card';
import DeleteRoleButton from '@/components/roles/DeleteRoleButton';
import EditRoleForm from '@/components/roles/EditRoleForm';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { getRole, listPermissions } from '@/lib/platform/platformServer';
import { readServerSession } from '@/lib/session/readServerSession';

export default async function EditRolePage({ params }: { params: Promise<{ roleId: string }> }) {
  const { roleId } = await params;
  const session = await readServerSession();
  const detail = await getRole(roleId);
  const permissions = await listPermissions();
  const canDelete = hasPermission(session, AdminPermissions.ROLES_DELETE);
  const canEdit = hasPermission(session, AdminPermissions.ROLES_EDIT);

  if (!detail) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">Role not found</p>
      </Card>
    );
  }

  if (!canEdit) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">You do not have permission to edit roles.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{detail.role.name}</h1>
          <p className="mt-2 text-sm text-zinc-600">Edit role and replace its permission set.</p>
        </div>
        <DeleteRoleButton roleId={roleId} disabled={!canDelete} />
      </div>

      <Card className="rounded-[32px] p-6">
        <EditRoleForm roleId={roleId} initial={detail} permissions={permissions} />
      </Card>
    </div>
  );
}

