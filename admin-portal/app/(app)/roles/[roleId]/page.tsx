import Link from 'next/link';

import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import DeleteRoleButton from '@/components/roles/DeleteRoleButton';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { getRole, listPermissions } from '@/lib/platform/platformServer';
import { readServerSession } from '@/lib/session/readServerSession';

export default async function RoleDetailPage({ params }: { params: Promise<{ roleId: string }> }) {
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

  const selectedPermissions = permissions.filter((p) => detail.permissionCodes.includes(p.code));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{detail.role.name}</h1>
          <p className="mt-2 text-sm text-zinc-600">Role details and assigned permissions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/roles/${roleId}/edit`}>
            <Button variant="outline" disabled={!canEdit} title={!canEdit ? "You don't have permission to edit roles" : undefined}>
              Edit
            </Button>
          </Link>
          <DeleteRoleButton roleId={roleId} disabled={!canDelete} />
        </div>
      </div>

      <Card className="rounded-[32px] p-6">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Role name</p>
              <p className="mt-1 text-sm text-zinc-700">{detail.role.name}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">Description</p>
              <p className="mt-1 text-sm text-zinc-700">{detail.role.description ?? '—'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-zinc-900">Permissions</p>
            {selectedPermissions.length === 0 ? (
              <p className="text-sm text-zinc-600">No permissions assigned.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedPermissions.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-black/5 bg-white px-4 py-3">
                    <p className="text-sm font-semibold text-zinc-900">{p.code}</p>
                    {p.description ? <p className="mt-1 text-sm text-zinc-600">{p.description}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

