import Card from '@/components/ui/card';
import NewStaffForm from '@/components/staff/NewStaffForm';
import { listRoles } from '@/lib/platform/platformServer';

export default async function NewStaffPage() {
  const roles = await listRoles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Create admin user</h1>
        <p className="mt-2 text-sm text-zinc-600">Admin users must be assigned exactly one role.</p>
      </div>

      <Card className="rounded-[32px] p-6">
        <NewStaffForm roles={roles} />
      </Card>
    </div>
  );
}

