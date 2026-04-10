import Link from 'next/link';

import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { listRoles, listStaff } from '@/lib/platform/platformServer';
import { readServerSession } from '@/lib/session/readServerSession';

export default async function StaffPage() {
  const session = await readServerSession();
  const [staff, roles] = await Promise.all([listStaff(), listRoles()]);
  const canCreateUser = hasPermission(session, AdminPermissions.ADMIN_USERS_CREATE);
  const canCreateRole = hasPermission(session, AdminPermissions.ROLES_CREATE);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Admin users</h1>
          <p className="mt-2 text-sm text-zinc-600">Create and manage platform staff users.</p>
        </div>
        {canCreateUser ? (
          <Link href="/staff/new">
            <Button disabled={roles.length === 0}>Create user</Button>
          </Link>
        ) : (
          <Button disabled title="You don't have permission to create users">
            Create user
          </Button>
        )}
      </div>

      {roles.length === 0 ? (
        <Card className="rounded-[32px] p-6">
          <p className="text-sm text-zinc-600">
            Create at least one role first so you can assign it to staff users.
          </p>
          <div className="mt-4">
            {canCreateRole ? (
              <Link href="/roles/new">
                <Button>Create role</Button>
              </Link>
            ) : (
              <Button disabled title="You don't have permission to create roles">
                Create role
              </Button>
            )}
          </div>
        </Card>
      ) : null}

      <Card className="rounded-[32px] p-6">
        <div className="divide-y divide-black/5">
          {staff.length === 0 ? (
            <p className="py-10 text-sm text-zinc-600">No staff users yet.</p>
          ) : (
            staff.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{u.fullName || u.email}</p>
                  <p className="mt-1 text-sm text-zinc-600">{u.email}</p>
                </div>
                <Link href={`/staff/${u.id}`}>
                  <Button variant="secondary" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

