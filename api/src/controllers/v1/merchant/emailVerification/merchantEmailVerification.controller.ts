import type { Request, Response } from 'express';
import { randomInt } from 'crypto';
import { z } from 'zod';

import { getDataSource } from '../../../../config/database.js';
import { loadEnv } from '../../../../config/env.js';
import { MerchantUser } from '../../../../entities/MerchantUser.js';
import { OtpChallenge } from '../../../../entities/OtpChallenge.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';
import { hashPassword, verifyPassword } from '../../../../lib/auth/password.js';
import { sendEmail } from '../../../../lib/notifications/email.js';

const env = loadEnv();

const sendSchema = z.object({
  purpose: z.string().min(1).default('EMAIL_VERIFICATION'),
});

export async function sendMerchantEmailVerification(req: Request, res: Response): Promise<void> {
  const userId = req.auth?.merchant?.merchantUserId ?? null;
  if (!userId) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthorized');

  const parsed = sendSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());
  }

  const userRepo = getDataSource().getRepository(MerchantUser);
  const user = await userRepo.findOne({ where: { id: userId }, relations: { merchant: true } });
  if (!user) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthorized');

  if (user.merchant.status !== 'ACTIVE') {
    throw new AppError(403, ErrorCodes.FORBIDDEN, 'Email verification is available after approval');
  }

  if (user.emailVerifiedAt) {
    res.json({ ok: true, alreadyVerified: true });
    return;
  }

  const fixed =
    env.NODE_ENV !== 'production'
      ? (process.env.OTP_FIXED_CODE?.trim() || '123456')
      : null;
  const code = fixed ?? String(randomInt(100000, 1000000));
  const codeHash = await hashPassword({ password: code });
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const challengeRepo = getDataSource().getRepository(OtpChallenge);
  const challenge = await challengeRepo.save(
    challengeRepo.create({
      phoneE164: '',
      email: user.email.toLowerCase(),
      purpose: parsed.data.purpose,
      codeHash,
      expiresAt,
      consumedAt: null,
    }),
  );

  await sendEmail({
    to: [user.email.toLowerCase()],
    subject: 'Perkzio: Verify your email',
    text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`,
  });

  res.json({
    ok: true,
    challengeId: challenge.id,
    expiresAt: challenge.expiresAt,
    ...(env.NODE_ENV !== 'production' ? { debugCode: code } : null),
  });
}

const verifySchema = z.object({
  challengeId: z.string().uuid(),
  code: z.string().min(4).max(10),
  purpose: z.string().min(1).default('EMAIL_VERIFICATION'),
});

export async function verifyMerchantEmailVerification(req: Request, res: Response): Promise<void> {
  const userId = req.auth?.merchant?.merchantUserId ?? null;
  if (!userId) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthorized');

  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());
  }

  const userRepo = getDataSource().getRepository(MerchantUser);
  const user = await userRepo.findOne({ where: { id: userId }, relations: { merchant: true } });
  if (!user) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthorized');

  if (user.merchant.status !== 'ACTIVE') {
    throw new AppError(403, ErrorCodes.FORBIDDEN, 'Email verification is available after approval');
  }

  const repo = getDataSource().getRepository(OtpChallenge);
  const challenge = await repo.findOne({ where: { id: parsed.data.challengeId } });
  if (!challenge) throw new AppError(404, ErrorCodes.NOT_FOUND, 'OTP challenge not found');
  if (challenge.purpose !== parsed.data.purpose) throw new AppError(409, ErrorCodes.CONFLICT, 'Invalid OTP purpose');
  if (!challenge.email || challenge.email.toLowerCase() !== user.email.toLowerCase()) {
    throw new AppError(403, ErrorCodes.FORBIDDEN, 'OTP does not match this account');
  }
  if (challenge.consumedAt) throw new AppError(409, ErrorCodes.CONFLICT, 'OTP already used');
  if (!challenge.expiresAt || challenge.expiresAt.getTime() < Date.now()) throw new AppError(410, ErrorCodes.GONE, 'OTP expired');

  const ok = await verifyPassword({ password: parsed.data.code, passwordHash: challenge.codeHash ?? '' });
  if (!ok) throw new AppError(401, ErrorCodes.UNAUTHENTICATED, 'Invalid OTP');

  challenge.consumedAt = new Date();
  await repo.save(challenge);

  user.emailVerifiedAt = new Date();
  await userRepo.save(user);

  res.json({ ok: true, emailVerifiedAt: user.emailVerifiedAt });
}

