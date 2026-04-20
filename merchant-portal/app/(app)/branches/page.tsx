import BranchesWorkspace from '@/components/branches/BranchesWorkspace';
import type { BranchesListDto } from '@/components/branches/types';
import { fetchInternalApi } from '@/lib/server/internalFetch';

const PAGE_SIZE = 10;

async function getBranches(input: { q: string | null; status: string | null; page: number }): Promise<BranchesListDto | null> {
  const p = new URLSearchParams();
  p.set('limit', String(PAGE_SIZE));
  p.set('offset', String((input.page - 1) * PAGE_SIZE));
  if (input.q) p.set('q', input.q);
  if (input.status) p.set('status', input.status);
  const res = await fetchInternalApi(`/api/merchant/branches?${p.toString()}`);
  if (!res || !res.ok) return null;
  return (await res.json().catch(() => null)) as BranchesListDto | null;
}

async function getViewerRoleFallback(): Promise<string | null> {
  const res = await fetchInternalApi('/api/merchant/me');
  if (!res || !res.ok) return null;
  const json = (await res.json().catch(() => null)) as unknown;
  const role =
    json && typeof json === 'object'
      ? (json as { user?: { role?: unknown } }).user?.role
      : null;
  return typeof role === 'string' ? role : null;
}

export default async function BranchesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === 'string' && sp.q.trim() ? sp.q.trim() : null;
  const status = typeof sp.status === 'string' && sp.status.trim() ? sp.status.trim() : null;
  const pageRaw = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const [raw, viewerRoleFallback] = await Promise.all([getBranches({ q, status, page }), getViewerRoleFallback()]);
  const loadFailed = raw === null;
  const data = raw?.ok ? raw : null;

  return (
    <BranchesWorkspace
      data={data}
      loadFailed={loadFailed}
      viewerRoleFallback={viewerRoleFallback}
      q={q}
      status={status}
      page={page}
      pageSize={PAGE_SIZE}
    />
  );
}
