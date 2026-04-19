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

export async function listMerchantApplications(status?: string): Promise<MerchantApplicationSummaryDto[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const result = await authedBackendFetch({ method: 'GET', path: `/v1/platform/merchant-applications${qs}` });
  const json = result.ok ? (result.json as { applications?: unknown }).applications : null;
  return Array.isArray(json) ? (json as MerchantApplicationSummaryDto[]) : [];
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
  kycStatus: string;
  primaryBusinessEmail: string | null;
  createdAt: string;
}

export async function listMerchants(q?: string): Promise<MerchantDto[]> {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  const result = await authedBackendFetch({ method: 'GET', path: `/v1/platform/merchants${qs}` });
  const json = result.ok ? (result.json as { merchants?: unknown }).merchants : null;
  return Array.isArray(json) ? (json as MerchantDto[]) : [];
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

