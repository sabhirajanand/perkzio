import type { Request, Response } from 'express';
import { randomInt } from 'crypto';
import { z } from 'zod';
import { loadEnv } from '../../../../config/env.js';
import { getDataSource } from '../../../../config/database.js';
import { OtpChallenge } from '../../../../entities/OtpChallenge.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';
import { hashPassword, verifyPassword } from '../../../../lib/auth/password.js';
import { sendEmail } from '../../../../lib/notifications/email.js';

const env = loadEnv();

function normalizePhoneE164(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith('+')) return `+${trimmed.replace(/[^\d]/g, '')}`;
  const digits = trimmed.replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

const sendOtpSchema = z
  .object({
    channel: z.enum(['PHONE', 'EMAIL']).default('PHONE'),
    phone: z.string().min(6).optional(),
    email: z.string().email().optional(),
    purpose: z.string().min(1).default('ONBOARDING'),
  })
  .superRefine((v, ctx) => {
    if (v.channel === 'PHONE' && !v.phone) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Phone is required', path: ['phone'] });
    if (v.channel === 'EMAIL' && !v.email) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Email is required', path: ['email'] });
  });

export async function sendOtp(req: Request, res: Response): Promise<void> {
  const parsed = sendOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());
  }

  const phoneE164 =
    parsed.data.channel === 'PHONE'
      ? normalizePhoneE164(parsed.data.phone ?? '')
      : '';
  const email = parsed.data.channel === 'EMAIL' ? (parsed.data.email ?? '').trim().toLowerCase() : null;
  if (parsed.data.channel === 'PHONE') {
    if (!phoneE164 || phoneE164.length < 8) {
      throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid phone number');
    }
  }
  if (parsed.data.channel === 'EMAIL') {
    if (!email) {
      throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid email');
    }
  }

  const fixed =
    env.NODE_ENV !== 'production'
      ? (process.env.OTP_FIXED_CODE?.trim() || '123456')
      : null;
  const code = fixed ?? String(randomInt(100000, 1000000));
  const codeHash = await hashPassword({ password: code });
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const repo = getDataSource().getRepository(OtpChallenge);
  const challenge = await repo.save(
    repo.create({
      phoneE164: parsed.data.channel === 'PHONE' ? phoneE164 : '',
      email: parsed.data.channel === 'EMAIL' ? email : null,
      purpose: parsed.data.purpose,
      codeHash,
      expiresAt,
      consumedAt: null,
    }),
  );

  if (parsed.data.channel === 'EMAIL' && email) {
    await sendEmail({
      to: [email],
      subject: 'Perkzio: Email verification code',
      text: `Your verification code is ${code}. It expires in 5 minutes.`,
    });
  }

  res.json({
    ok: true,
    challengeId: challenge.id,
    expiresAt: challenge.expiresAt,
    ...(env.NODE_ENV !== 'production' ? { debugCode: code } : null),
  });
}

const verifyOtpSchema = z.object({
  challengeId: z.string().uuid(),
  code: z.string().min(4).max(10),
});

export async function verifyOtp(req: Request, res: Response): Promise<void> {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());
  }

  const repo = getDataSource().getRepository(OtpChallenge);
  const challenge = await repo.findOne({ where: { id: parsed.data.challengeId } });
  if (!challenge) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, 'OTP challenge not found');
  }
  if (challenge.consumedAt) {
    throw new AppError(409, ErrorCodes.CONFLICT, 'OTP already used');
  }
  if (!challenge.expiresAt || challenge.expiresAt.getTime() < Date.now()) {
    throw new AppError(410, ErrorCodes.GONE, 'OTP expired');
  }

  const ok = await verifyPassword({ password: parsed.data.code, passwordHash: challenge.codeHash });
  if (!ok) {
    throw new AppError(401, ErrorCodes.UNAUTHENTICATED, 'Invalid OTP');
  }

  challenge.consumedAt = new Date();
  await repo.save(challenge);

  res.json({
    ok: true,
    challengeId: challenge.id,
    verifiedAt: challenge.consumedAt,
  });
}

