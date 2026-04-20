import type { Request, Response } from 'express';
import { z } from 'zod';

import { getDataSource } from '../../../../config/database.js';
import { loadEnv } from '../../../../config/env.js';
import { PlatformStaff } from '../../../../entities/PlatformStaff.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';
import { verifyPassword } from '../../../../lib/auth/password.js';
import { signAdminAccessToken } from '../../../../lib/auth/adminTokens.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
});

export async function adminLogin(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());
  }

  const repo = getDataSource().getRepository(PlatformStaff);
  const staff = await repo.findOne({ where: { email: parsed.data.email.toLowerCase() } });
  if (!staff) {
    throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const ok = await verifyPassword({ password: parsed.data.password, passwordHash: staff.passwordHash });
  if (!ok) {
    throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const env = loadEnv();
  const staffType = env.SUPERADMIN_EMAILS.includes(staff.email.toLowerCase()) ? 'SUPERADMIN' : 'ADMIN';
  const token = signAdminAccessToken({
    env,
    claims: { sub: staff.id, userType: staffType },
    ttlSeconds: parsed.data.rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 8,
  });

  res.status(200).json({
    token,
    user: { id: staff.id, email: staff.email, fullName: staff.fullName, status: staff.status },
  });
}

export function adminMe(req: Request, res: Response): void {
  if (!req.auth?.staff) {
    throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthorized');
  }

  res.status(200).json({
    userType: req.auth.userType,
    staff: {
      id: req.auth.staff.staffId,
      roleId: req.auth.staff.roleId,
      permissions: req.auth.userType === 'SUPERADMIN' ? ['*'] : req.auth.staff.permissions,
    },
  });
}

