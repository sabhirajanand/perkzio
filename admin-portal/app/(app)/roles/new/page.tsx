import NewRoleForm from '@/components/roles/NewRoleForm';
import Card from '@/components/ui/card';
import { listPermissions } from '@/lib/platform/platformServer';

export default async function NewRolePage() {
  const permissions = await listPermissions();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Create role</h1>
        <p className="mt-2 text-sm text-zinc-600">Assign permissions to define what admins can access.</p>
      </div>

      <Card className="rounded-[32px] p-6">
        <NewRoleForm permissions={permissions} />
      </Card>
    </div>
  );
}

