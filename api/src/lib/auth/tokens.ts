import jwt from 'jsonwebtoken';
import type { Env } from '../../config/env.js';

export interface MerchantAccessTokenClaims {
  sub: string;
  merchantId: string;
  role: string;
  branchId: string | null;
}

export function signMerchantAccessToken(input: {
  env: Env;
  claims: MerchantAccessTokenClaims;
}): string {
  const secret = input.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not set');
  }

  return jwt.sign(input.claims, secret, {
    expiresIn: input.env.JWT_ACCESS_TTL_SECONDS,
  });
}

