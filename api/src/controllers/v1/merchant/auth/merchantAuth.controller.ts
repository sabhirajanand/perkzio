import type { Request, Response } from 'express';
import { z } from 'zod';

import { getDataSource } from '../../../../config/database.js';
import { loadEnv } from '../../../../config/env.js';
import { MerchantUser } from '../../../../entities/MerchantUser.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';
import { verifyPassword } from '../../../../lib/auth/password.js';
import { signMerchantAccessToken } from '../../../../lib/auth/tokens.js';

const merchantLoginSchema = z.object({
  role: z.enum(['MERCHANT_ADMIN', 'BRANCH_ADMIN']),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function merchantLogin(req: Request, res: Response): Promise<void> {
  const parsed = merchantLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());
  }

  const repo = getDataSource().getRepository(MerchantUser);
  const user = await repo.findOne({
    where: { email: parsed.data.email.toLowerCase(), role: parsed.data.role },
    relations: { merchant: true, branch: true },
  });
  if (!user) {
    throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError(403, ErrorCodes.FORBIDDEN, 'Account is not active');
  }
  if (user.merchant.status === 'INACTIVE') {
    throw new AppError(403, ErrorCodes.FORBIDDEN, 'Account is not active');
  }

  const ok = await verifyPassword({ password: parsed.data.password, passwordHash: user.passwordHash });
  if (!ok) {
    throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  user.lastLoginAt = new Date();
  await repo.save(user);

  const env = loadEnv();
  const token = signMerchantAccessToken({
    env,
    claims: {
      sub: user.id,
      merchantId: user.merchant.id,
      role: user.role,
      branchId: user.branch ? user.branch.id : null,
    },
  });

  res.status(200).json({
    token,
    user: {
      id: user.id,
      role: user.role,
      merchantId: user.merchant.id,
      branchId: user.branch ? user.branch.id : null,
    },
  });
}

export function merchantLogout(_req: Request, res: Response): void {
  res.status(200).json({ ok: true });
}

