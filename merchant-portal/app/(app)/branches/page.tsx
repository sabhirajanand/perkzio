import BranchesWorkspace from '@/components/branches/BranchesWorkspace';
import type { BranchRequestsListDto, BranchesListDto } from '@/components/branches/types';
import { fetchInternalApi } from '@/lib/server/internalFetch';

async function getBranches(): Promise<BranchesListDto | null> {
  const res = await fetchInternalApi('/api/merchant/branches');
  if (!res || !res.ok) return null;
  return (await res.json().catch(() => null)) as BranchesListDto | null;
}

async function getBranchRequests(): Promise<BranchRequestsListDto | null> {
  const res = await fetchInternalApi('/api/merchant/branch-requests');
  if (!res) return null;
  if (res.status === 403) return { ok: true, requests: [] };
  if (!res.ok) return null;
  const json = (await res.json().catch(() => null)) as BranchRequestsListDto | null;
  return json?.ok ? json : null;
}

export default async function BranchesPage() {
  const [raw, requestsRaw] = await Promise.all([getBranches(), getBranchRequests()]);
  const loadFailed = raw === null;
  const data = raw?.ok ? raw : null;
  const branchRequests = requestsRaw?.requests ?? [];
  const requestsLoadFailed = requestsRaw === null;

  return (
    <BranchesWorkspace
      data={data}
      loadFailed={loadFailed}
      branchRequests={branchRequests}
      requestsLoadFailed={requestsLoadFailed}
    />
  );
}
