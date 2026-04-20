import { cookies } from 'next/headers';

import { proxyToBackend } from '@/app/api/_lib/backend';

async function authedBackendFetch(input: {
  method: 'GET' | 'POST' | 'PATCH';
  path: string;
  body?: unknown;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('ap_session')?.value ?? null;
  if (!token) return { ok: false, status: 401 as const, json: null };
  return proxyToBackend({
    method: input.method,
    path: input.path,
    body: input.body,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export interface PlatformRoleDto {
  id: string;
  name: string;
  description: string | null;
}

export async function listRoles(): Promise<PlatformRoleDto[]> {
  const result = await authedBackendFetch({ method: 'GET', path: '/v1/platform/roles' });
  const json = result.ok ? (result.json as { roles?: unknown }).roles : null;
  return Array.isArray(json) ? (json as PlatformRoleDto[]) : [];
}

export interface PlatformPermissionDto {
  id: string;
  code: string;
  description: string | null;
}

export async function listPermissions(): Promise<PlatformPermissionDto[]> {
  const result = await authedBackendFetch({ method: 'GET', path: '/v1/platform/permissions' });
  const json = result.ok ? (result.json as { permissions?: unknown }).permissions : null;
  return Array.isArray(json) ? (json as PlatformPermissionDto[]) : [];
}

export interface RoleDetailDto {
  role: PlatformRoleDto;
  permissionCodes: string[];
}

export async function getRole(roleId: string): Promise<RoleDetailDto | null> {
  const result = await authedBackendFetch({ method: 'GET', path: `/v1/platform/roles/${roleId}` });
  if (!result.ok || !result.json || typeof result.json !== 'object') return null;
  const json = result.json as { role?: unknown; permissionCodes?: unknown };
  if (!json.role || typeof json.role !== 'object') return null;
  const role = json.role as PlatformRoleDto;
  const permissionCodes = Array.isArray(json.permissionCodes) ? (json.permissionCodes as string[]) : [];
  return { role, permissionCodes };
}

export interface PlatformStaffDto {
  id: string;
  email: string;
  fullName: string | null;
  status: string;
  createdAt: string;
}

export async function listStaff(): Promise<PlatformStaffDto[]> {
  const result = await authedBackendFetch({ method: 'GET', path: '/v1/platform/staff' });
  const json = result.ok ? (result.json as { staff?: unknown }).staff : null;
  return Array.isArray(json) ? (json as PlatformStaffDto[]) : [];
}

export interface StaffDetailDto {
  staff: PlatformStaffDto;
  roleId: string | null;
}

export async function getStaff(staffId: string): Promise<StaffDetailDto | null> {
  const result = await authedBackendFetch({ method: 'GET', path: `/v1/platform/staff/${staffId}` });
  if (!result.ok || !result.json || typeof result.json !== 'object') return null;
  const json = result.json as { staff?: unknown; roleId?: unknown };
  if (!json.staff || typeof json.staff !== 'object') return null;
  return { staff: json.staff as PlatformStaffDto, roleId: typeof json.roleId === 'string' ? json.roleId : null };
}

export interface MerchantApplicationSummaryDto {
  id: string;
  referenceNumber: string;
  status: string;
  createdAt: string;
  businessName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  plan: string | null;
  outletsCount: number | null;
}

export interface MerchantApplicationsListDto {
  ok: true;
  total: number;
  limit: number;
  offset: number;
  applications: MerchantApplicationSummaryDto[];
}

export async function listMerchantApplicationsPage(input?: {
  status?: string | null;
  q?: string | null;
  planCode?: string | null;
  createdFrom?: string | null;
  createdTo?: string | null;
  limit?: number;
  offset?: number;
}): Promise<MerchantApplicationsListDto> {
  const p = new URLSearchParams();
  if (input?.status) p.set('status', input.status);
  if (input?.q) p.set('q', input.q);
  if (input?.planCode) p.set('planCode', input.planCode);
  if (input?.createdFrom) p.set('createdFrom', input.createdFrom);
  if (input?.createdTo) p.set('createdTo', input.createdTo);
  if (typeof input?.limit === 'number') p.set('limit', String(input.limit));
  if (typeof input?.offset === 'number') p.set('offset', String(input.offset));
  const qs = p.toString() ? `?${p.toString()}` : '';
  const result = await authedBackendFetch({ method: 'GET', path: `/v1/platform/merchant-applications${qs}` });
  const json =
    result.ok && result.json && typeof result.json === 'object'
      ? (result.json as Partial<MerchantApplicationsListDto>)
      : null;
  return {
    ok: true,
    total: typeof json?.total === 'number' ? json.total : 0,
    limit: typeof json?.limit === 'number' ? json.limit : (typeof input?.limit === 'number' ? input.limit : 10),
    offset: typeof json?.offset === 'number' ? json.offset : (typeof input?.offset === 'number' ? input.offset : 0),
    applications: Array.isArray(json?.applications) ? (json?.applications as MerchantApplicationSummaryDto[]) : [],
  };
}

export async function getMerchantApplication(applicationId: string): Promise<unknown | null> {
  const result = await authedBackendFetch({ method: 'GET', path: `/v1/platform/merchant-applications/${applicationId}` });
  if (!result.ok) return null;
  return result.json ?? null;
}

export interface MerchantDto {
  id: string;
  legalName: string;
  status: string;
  primaryBusinessEmail: string | null;
  createdAt: string;
  plan: { code: string; name: string } | null;
}

export interface MerchantsListDto {
  ok: true;
  total: number;
  limit: number;
  offset: number;
  merchants: MerchantDto[];
}

export interface BranchDto {
  id: string;
  name: string;
  status: string;
  isHeadBranch: boolean;
  address: Record<string, unknown> | null;
  createdAt: string;
  merchant: { id: string; legalName: string; primaryBusinessEmail: string | null };
  adminEmail: string | null;
  plan: { code: string; name: string } | null;
}

export interface BranchesListDto {
  ok: true;
  total: number;
  limit: number;
  offset: number;
  branches: BranchDto[];
}

export interface BranchDetailDto {
  ok: true;
  branch: BranchDto & {
    googleMapsPlaceId: string | null;
    latitude: number | null;
    longitude: number | null;
    openingHours: unknown;
    socialLinks: unknown;
    updatedAt: string;
  };
  branchRequest: {
    id: string;
    status: string;
    branchName: string;
    adminName: string | null;
    adminEmail: string;
    adminPhone: string | null;
    payload: unknown;
    createdAt: string;
    reviewedAt: string | null;
    rejectionReason: string | null;
  } | null;
}

export async function listMerchantsPage(input?: {
  q?: string | null;
  status?: string | null;
  planCode?: string | null;
  createdFrom?: string | null;
  createdTo?: string | null;
  limit?: number;
  offset?: number;
}): Promise<MerchantsListDto> {
  const p = new URLSearchParams();
  if (input?.q) p.set('q', input.q);
  if (input?.status) p.set('status', input.status);
  if (input?.planCode) p.set('planCode', input.planCode);
  if (input?.createdFrom) p.set('createdFrom', input.createdFrom);
  if (input?.createdTo) p.set('createdTo', input.createdTo);
  if (typeof input?.limit === 'number') p.set('limit', String(input.limit));
  if (typeof input?.offset === 'number') p.set('offset', String(input.offset));
  const qs = p.toString() ? `?${p.toString()}` : '';
  const result = await authedBackendFetch({ method: 'GET', path: `/v1/platform/merchants${qs}` });
  const json = result.ok && result.json && typeof result.json === 'object' ? (result.json as Partial<MerchantsListDto>) : null;
  return {
    ok: true,
    total: typeof json?.total === 'number' ? json.total : 0,
    limit: typeof json?.limit === 'number' ? json.limit : (typeof input?.limit === 'number' ? input.limit : 10),
    offset: typeof json?.offset === 'number' ? json.offset : (typeof input?.offset === 'number' ? input.offset : 0),
    merchants: Array.isArray(json?.merchants) ? (json?.merchants as MerchantDto[]) : [],
  };
}

export async function listBranchesPage(input?: {
  q?: string | null;
  status?: string | null;
  planCode?: string | null;
  createdFrom?: string | null;
  createdTo?: string | null;
  limit?: number;
  offset?: number;
}): Promise<BranchesListDto> {
  const p = new URLSearchParams();
  if (input?.q) p.set('q', input.q);
  if (input?.status) p.set('status', input.status);
  if (input?.planCode) p.set('planCode', input.planCode);
  if (input?.createdFrom) p.set('createdFrom', input.createdFrom);
  if (input?.createdTo) p.set('createdTo', input.createdTo);
  if (typeof input?.limit === 'number') p.set('limit', String(input.limit));
  if (typeof input?.offset === 'number') p.set('offset', String(input.offset));
  const qs = p.toString() ? `?${p.toString()}` : '';
  const result = await authedBackendFetch({ method: 'GET', path: `/v1/platform/branches${qs}` });
  const json =
    result.ok && result.json && typeof result.json === 'object' ? (result.json as Partial<BranchesListDto>) : null;
  return {
    ok: true,
    total: typeof json?.total === 'number' ? json.total : 0,
    limit: typeof json?.limit === 'number' ? json.limit : (typeof input?.limit === 'number' ? input.limit : 10),
    offset: typeof json?.offset === 'number' ? json.offset : (typeof input?.offset === 'number' ? input.offset : 0),
    branches: Array.isArray(json?.branches) ? (json?.branches as BranchDto[]) : [],
  };
}

export async function getBranch(branchId: string): Promise<BranchDetailDto | null> {
  const result = await authedBackendFetch({ method: 'GET', path: `/v1/platform/branches/${branchId}` });
  if (!result.ok || !result.json || typeof result.json !== 'object') return null;
  return result.json as BranchDetailDto;
}

// Backward-compatible helper for older call sites.
export async function listMerchants(q?: string): Promise<MerchantDto[]> {
  const page = await listMerchantsPage({ q: q ?? null, limit: 100, offset: 0 });
  return page.merchants;
}

export interface MerchantDetailDto {
  merchant: {
    id: string;
    legalName: string;
    tradingName: string | null;
    status: string;
    kycStatus: string;
    subscriptionLimitedMode: boolean;
    primaryBusinessEmail: string | null;
    pan: string | null;
    gstin: string | null;
    registeredAddress: unknown;
    referralCode?: string | null;
    createdAt: string;
    updatedAt: string;
    category?: { id: string; name: string; slug: string } | null;
  };
  headBranch: Record<string, unknown> | null;
  onboardingApplication: Record<string, unknown> | null;
}

export async function getMerchant(merchantId: string): Promise<MerchantDetailDto | null> {
  const result = await authedBackendFetch({ method: 'GET', path: `/v1/platform/merchants/${merchantId}` });
  if (!result.ok || !result.json || typeof result.json !== 'object') return null;
  const json = result.json as {
    merchant?: unknown;
    headBranch?: unknown;
    onboardingApplication?: unknown;
  };
  if (!json.merchant || typeof json.merchant !== 'object') return null;
  return {
    merchant: json.merchant as MerchantDetailDto['merchant'],
    headBranch:
      json.headBranch !== undefined && json.headBranch !== null && typeof json.headBranch === 'object'
        ? (json.headBranch as Record<string, unknown>)
        : null,
    onboardingApplication:
      json.onboardingApplication !== undefined &&
      json.onboardingApplication !== null &&
      typeof json.onboardingApplication === 'object'
        ? (json.onboardingApplication as Record<string, unknown>)
        : null,
  };
}

export interface MerchantBranchRequestDto {
  id: string;
  branchName: string;
  status: string;
  adminEmail: string;
  adminName: string;
  adminPhone: string;
  payload: unknown;
  createdAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  resolvedBranchId: string | null;
}

export async function listMerchantBranchRequests(merchantId: string): Promise<MerchantBranchRequestDto[]> {
  const result = await authedBackendFetch({
    method: 'GET',
    path: `/v1/platform/merchants/${merchantId}/branch-requests`,
  });
  if (!result.ok || !result.json || typeof result.json !== 'object') return [];
  const json = result.json as { requests?: unknown };
  return Array.isArray(json.requests) ? (json.requests as MerchantBranchRequestDto[]) : [];
}

export interface BranchRequestsIndexRowDto {
  id: string;
  merchant: { id: string; legalName: string; primaryBusinessEmail: string | null; status: string } | null;
  branchName: string;
  status: string;
  adminEmail: string;
  adminName: string;
  adminPhone: string;
  createdAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  resolvedBranchId: string | null;
}

export async function listAllBranchRequests(input?: {
  status?: string;
  merchantId?: string;
}): Promise<BranchRequestsIndexRowDto[]> {
  const qs = new URLSearchParams();
  if (input?.status) qs.set('status', input.status);
  if (input?.merchantId) qs.set('merchantId', input.merchantId);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const result = await authedBackendFetch({ method: 'GET', path: `/v1/platform/merchant-branch-requests${suffix}` });
  if (result.ok && result.json && typeof result.json === 'object') {
    const json = result.json as { requests?: unknown };
    return Array.isArray(json.requests) ? (json.requests as BranchRequestsIndexRowDto[]) : [];
  }

  // Backward-compatible fallback (in case API server isn't running the new index endpoint yet).
  if (result.status === 404) {
    const merchants = await listMerchants();
    const filteredMerchants = input?.merchantId ? merchants.filter((m) => m.id === input.merchantId) : merchants;
    const perMerchant = await Promise.all(
      filteredMerchants.map(async (m) => {
        const rows = await listMerchantBranchRequests(m.id);
        return rows
          .filter((r) => (input?.status ? r.status === input.status : true))
          .map<BranchRequestsIndexRowDto>((r) => ({
            id: r.id,
            merchant: {
              id: m.id,
              legalName: m.legalName,
              primaryBusinessEmail: m.primaryBusinessEmail,
              status: m.status,
            },
            branchName: r.branchName,
            status: r.status,
            adminEmail: r.adminEmail,
            adminName: r.adminName,
            adminPhone: r.adminPhone,
            createdAt: r.createdAt,
            reviewedAt: r.reviewedAt,
            rejectionReason: r.rejectionReason,
            resolvedBranchId: r.resolvedBranchId,
          }));
      }),
    );
    return perMerchant.flat().sort((a, b) => (a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0));
  }

  return [];
}

export interface BranchRequestDetailDto {
  request: MerchantBranchRequestDto & {
    merchant: {
      id: string;
      legalName: string;
      primaryBusinessEmail: string | null;
      status: string;
      kycStatus: string;
      registeredAddress: unknown;
    } | null;
    reviewedByStaff: { id: string; email: string; fullName: string | null } | null;
  };
  headBranch: Record<string, unknown> | null;
  onboardingApplication: Record<string, unknown> | null;
}

export async function getBranchRequest(requestId: string): Promise<BranchRequestDetailDto | null> {
  const result = await authedBackendFetch({ method: 'GET', path: `/v1/platform/merchant-branch-requests/${requestId}` });
  if (!result.ok || !result.json || typeof result.json !== 'object') return null;
  return result.json as BranchRequestDetailDto;
}

