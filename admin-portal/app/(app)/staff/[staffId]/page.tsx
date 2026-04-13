import Link from 'next/link';

import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { getStaff, listRoles } from '@/lib/platform/platformServer';
import { readServerSession } from '@/lib/session/readServerSession';

export default async function StaffDetailPage({ params }: { params: Promise<{ staffId: string }> }) {
  const { staffId } = await params;
  const session = await readServerSession();
  const [detail, roles] = await Promise.all([getStaff(staffId), listRoles()]);
  const canEdit = hasPermission(session, AdminPermissions.ADMIN_USERS_EDIT);

  if (!detail) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">User not found</p>
      </Card>
    );
  }

  const roleName = roles.find((r) => r.id === detail.roleId)?.name ?? '—';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {detail.staff.fullName || detail.staff.email}
          </h1>
          <p className="mt-2 text-sm text-zinc-600">User details and current role assignment.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/staff/${staffId}/edit`}>
            <Button variant="outline" disabled={!canEdit} title={!canEdit ? "You don't have permission to edit users" : undefined}>
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <Card className="rounded-[32px] p-6">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Email</p>
              <p className="mt-1 text-sm text-zinc-700">{detail.staff.email}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">Full name</p>
              <p className="mt-1 text-sm text-zinc-700">{detail.staff.fullName ?? '—'}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Status</p>
              <p className="mt-1 text-sm text-zinc-700">{detail.staff.status}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">Role</p>
              <p className="mt-1 text-sm text-zinc-700">{roleName}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

