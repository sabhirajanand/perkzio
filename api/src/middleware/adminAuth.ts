import type { NextFunction, Request, Response } from 'express';

import { getDataSource } from '../config/database.js';
import { loadEnv } from '../config/env.js';
import { AppError } from '../errors/AppError.js';
import { ErrorCodes } from '../errors/codes.js';
import { PlatformStaff } from '../entities/PlatformStaff.js';
import { PlatformStaffRole } from '../entities/PlatformStaffRole.js';
import { PlatformRolePermission } from '../entities/PlatformRolePermission.js';
import { PlatformPermission } from '../entities/PlatformPermission.js';
import { verifyAdminAccessToken } from '../lib/auth/adminTokens.js';

function parseBearerToken(req: Request): string | null {
  const header = req.header('Authorization') || '';
  const m = header.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

export async function adminAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = parseBearerToken(req);
  if (!token) {
    return next(new AppError(401, ErrorCodes.UNAUTHORIZED, 'Missing token'));
  }

  let claims: { sub: string; userType: 'ADMIN' | 'SUPERADMIN' };
  try {
    const env = loadEnv();
    claims = verifyAdminAccessToken({ env, token });
  } catch {
    return next(new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid token'));
  }

  const ds = getDataSource();
  const staffRepo = ds.getRepository(PlatformStaff);
  const staff = await staffRepo.findOne({ where: { id: claims.sub } });
  if (!staff) {
    return next(new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid token'));
  }

  const roleRepo = ds.getRepository(PlatformStaffRole);
  const staffRole = await roleRepo.findOne({ where: { staffId: staff.id } });
  const roleId = staffRole?.roleId ?? null;

  const permissions: string[] = [];
  if (claims.userType === 'ADMIN') {
    if (roleId) {
      const permRows = await ds
        .getRepository(PlatformRolePermission)
        .createQueryBuilder('rp')
        .innerJoin(PlatformPermission, 'p', 'p.id = rp.permissionId')
        .select(['p.code AS code'])
        .where('rp.roleId = :roleId', { roleId })
        .getRawMany<{ code: string }>();
      for (const row of permRows) permissions.push(row.code);
    }
  }

  req.auth = {
    userType: claims.userType,
    staff: {
      staffId: staff.id,
      staffType: claims.userType,
      roleId,
      permissions,
    },
  };

  return next();
}

