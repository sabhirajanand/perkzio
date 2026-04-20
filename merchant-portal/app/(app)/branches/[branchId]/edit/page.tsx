import Card from '@/components/ui/card';
import type { BranchRow, BranchesListDto } from '@/components/branches/types';
import EditBranchForm from './EditBranchForm';

async function getBranchAndRole(branchId: string): Promise<{ branch: BranchRow; viewerRole: string } | null> {
  const p = new URLSearchParams();
  p.set('limit', '100');
  p.set('offset', '0');
  const res = await fetch(`/api/merchant/branches?${p.toString()}`, { cache: 'no-store' }).catch(() => null);
  if (!res || !res.ok) return null;
  const json = (await res.json().catch(() => null)) as BranchesListDto | null;
  const row = json?.ok ? json.branches.find((b) => b.id === branchId) : null;
  if (!row || !json?.ok) return null;
  return { branch: row, viewerRole: json.viewerRole };
}

export default async function EditBranchPage({ params }: { params: Promise<{ branchId: string }> }) {
  const { branchId } = await params;
  const payload = await getBranchAndRole(branchId);

  if (!payload) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">Branch not found</p>
      </Card>
    );
  }

  const canEdit = payload.viewerRole === 'MERCHANT_ADMIN';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Edit branch</h1>
        <p className="mt-2 text-sm text-zinc-600">Update existing branch details. Branch name is locked.</p>
      </div>

      <Card className="rounded-[32px] p-6">
        <EditBranchForm branch={payload.branch} canEdit={canEdit} />
      </Card>
    </div>
  );
}

