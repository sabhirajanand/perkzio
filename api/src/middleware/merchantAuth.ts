import type { NextFunction, Request, Response } from 'express';

import { getDataSource } from '../config/database.js';
import { loadEnv } from '../config/env.js';
import { MerchantUser } from '../entities/MerchantUser.js';
import { AppError } from '../errors/AppError.js';
import { ErrorCodes } from '../errors/codes.js';
import type { MerchantAccessTokenClaims } from '../lib/auth/tokens.js';
import jwt from 'jsonwebtoken';

function parseBearerToken(req: Request): string | null {
  const header = req.header('Authorization') || '';
  const m = header.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

function verifyMerchantToken(input: { token: string }): MerchantAccessTokenClaims {
  const env = loadEnv();
  const secret = env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not set');
  const decoded = jwt.verify(input.token, secret);
  if (!decoded || typeof decoded !== 'object') throw new Error('invalid_token');
  const { sub, merchantId, role, branchId } = decoded as {
    sub?: unknown;
    merchantId?: unknown;
    role?: unknown;
    branchId?: unknown;
  };
  if (typeof sub !== 'string') throw new Error('invalid_token');
  if (typeof merchantId !== 'string') throw new Error('invalid_token');
  if (typeof role !== 'string') throw new Error('invalid_token');
  if (!(branchId === null || typeof branchId === 'string')) throw new Error('invalid_token');
  return { sub, merchantId, role, branchId };
}

export async function merchantAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = parseBearerToken(req);
  if (!token) return next(new AppError(401, ErrorCodes.UNAUTHORIZED, 'Missing token'));

  let claims: MerchantAccessTokenClaims;
  try {
    claims = verifyMerchantToken({ token });
  } catch {
    return next(new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid token'));
  }

  const user = await getDataSource().getRepository(MerchantUser).findOne({
    where: { id: claims.sub },
    relations: { merchant: true, branch: true },
  });
  if (!user || user.status !== 'ACTIVE') {
    return next(new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid token'));
  }

  req.auth = {
    userType: 'MERCHANT',
    merchant: {
      merchantUserId: user.id,
      merchantId: user.merchant.id,
      role: user.role,
      branchId: user.branch ? user.branch.id : null,
    },
  } as never;

  return next();
}

