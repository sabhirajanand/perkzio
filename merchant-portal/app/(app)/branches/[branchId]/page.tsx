import Card from '@/components/ui/card';
import type { BranchRow, BranchesListDto } from '@/components/branches/types';

async function getBranch(branchId: string): Promise<BranchRow | null> {
  const p = new URLSearchParams();
  p.set('limit', '100');
  p.set('offset', '0');
  const res = await fetch(`/api/merchant/branches?${p.toString()}`, { cache: 'no-store' }).catch(() => null);
  if (!res || !res.ok) return null;
  const json = (await res.json().catch(() => null)) as BranchesListDto | null;
  const row = json?.ok ? json.branches.find((b) => b.id === branchId) : null;
  return row ?? null;
}

export default async function BranchViewPage({ params }: { params: Promise<{ branchId: string }> }) {
  const { branchId } = await params;
  const branch = await getBranch(branchId);

  if (!branch) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">Branch not found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{branch.name}</h1>
        <p className="mt-2 text-sm text-zinc-600">Branch details (read-only).</p>
      </div>

      <Card className="rounded-[32px] p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">Status</dt>
            <dd className="mt-1 text-sm font-semibold text-zinc-900">{branch.status}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">Branch admin</dt>
            <dd className="mt-1 text-sm font-semibold text-zinc-900">{branch.branchAdminEmail ?? '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">Address</dt>
            <dd className="mt-1 text-sm text-zinc-900">{branch.address ? JSON.stringify(branch.address) : '—'}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}

