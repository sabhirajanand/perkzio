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

