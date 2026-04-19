import CustomersWorkspace from '@/components/customers/CustomersWorkspace';
import type { CustomersListDto } from '@/components/customers/types';
import { buildMockCustomersListDto, shouldUseMockCustomers } from '@/lib/mock/customersPageMock';
import { fetchInternalApi } from '@/lib/server/internalFetch';

const PAGE_SIZE = 10;

async function getCustomers(q: string | null, page: number): Promise<CustomersListDto | null> {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  params.set('limit', String(PAGE_SIZE));
  params.set('offset', String((page - 1) * PAGE_SIZE));
  const res = await fetchInternalApi(`/api/merchant/customers?${params.toString()}`);
  if (!res || !res.ok) return null;
  return (await res.json().catch(() => null)) as CustomersListDto | null;
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === 'string' && sp.q.trim() ? sp.q.trim() : null;
  const pageRaw = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const raw = await getCustomers(q, page);
  const fetchFailed = raw === null;

  let data: CustomersListDto | null = null;
  let isPreview = false;

  if (fetchFailed && q) {
    data = null;
    isPreview = false;
  } else if (fetchFailed && !q) {
    data = buildMockCustomersListDto(page, PAGE_SIZE);
    isPreview = true;
  } else if (raw && shouldUseMockCustomers(raw, q)) {
    data = buildMockCustomersListDto(page, PAGE_SIZE);
    isPreview = true;
  } else {
    data = raw;
    isPreview = false;
  }

  return (
    <CustomersWorkspace
      data={data}
      q={q}
      page={page}
      pageSize={PAGE_SIZE}
      isPreview={isPreview}
      loadFailed={fetchFailed && Boolean(q)}
    />
  );
}
