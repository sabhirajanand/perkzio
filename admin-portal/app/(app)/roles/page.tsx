import Link from 'next/link';

import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { listRoles } from '@/lib/platform/platformServer';
import { readServerSession } from '@/lib/session/readServerSession';

export default async function RolesPage() {
  const session = await readServerSession();
  const roles = await listRoles();
  const canCreate = hasPermission(session, AdminPermissions.ROLES_CREATE);
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Roles</h1>
          <p className="mt-2 text-sm text-zinc-600">Create and manage admin roles and permissions.</p>
        </div>
        {canCreate ? (
          <Link href="/roles/new">
            <Button>Create role</Button>
          </Link>
        ) : (
          <Button disabled title="You don't have permission to create roles">
            Create role
          </Button>
        )}
      </div>

      <Card className="rounded-[32px] p-6">
        <div className="divide-y divide-black/5">
          {roles.length === 0 ? (
            <p className="py-10 text-sm text-zinc-600">No roles yet.</p>
          ) : (
            roles.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{r.name}</p>
                  {r.description ? <p className="mt-1 text-sm text-zinc-600">{r.description}</p> : null}
                </div>
                <Link href={`/roles/${r.id}`}>
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

