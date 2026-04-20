import jwt from 'jsonwebtoken';
import type { Env } from '../../config/env.js';

export interface AdminAccessTokenClaims {
  sub: string;
  userType: 'SUPERADMIN' | 'ADMIN';
}

export function signAdminAccessToken(input: { env: Env; claims: AdminAccessTokenClaims; ttlSeconds?: number }): string {
  const secret = input.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not set');
  const ttlSeconds = typeof input.ttlSeconds === 'number' && Number.isFinite(input.ttlSeconds) ? input.ttlSeconds : input.env.JWT_ACCESS_TTL_SECONDS;
  return jwt.sign(input.claims, secret, { expiresIn: ttlSeconds });
}

export function verifyAdminAccessToken(input: { env: Env; token: string }): AdminAccessTokenClaims {
  const secret = input.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not set');
  const decoded = jwt.verify(input.token, secret);
  if (!decoded || typeof decoded !== 'object') throw new Error('invalid_token');
  const { sub, userType } = decoded as { sub?: unknown; userType?: unknown };
  if (typeof sub !== 'string') throw new Error('invalid_token');
  if (userType !== 'ADMIN' && userType !== 'SUPERADMIN') throw new Error('invalid_token');
  return { sub, userType };
}

