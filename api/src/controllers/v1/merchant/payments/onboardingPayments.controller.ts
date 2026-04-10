import type { Request, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { getDataSource } from '../../../../config/database.js';
import { MerchantOnboardingApplication } from '../../../../entities/MerchantOnboardingApplication.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';
import { loadEnv } from '../../../../config/env.js';

const confirmSchema = z.object({
  applicationId: z.string().uuid(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

function verifyOrderSignature(input: { orderId: string; paymentId: string; signature: string; secret: string }): boolean {
  const body = `${input.orderId}|${input.paymentId}`;
  const expected = crypto.createHmac('sha256', input.secret).update(body).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(input.signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function confirmOnboardingPayment(req: Request, res: Response): Promise<void> {
  const parsed = confirmSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());
  }

  const env = loadEnv();
  if (!env.RAZORPAY_KEY_SECRET) {
    throw new AppError(500, ErrorCodes.INTERNAL_ERROR, 'RAZORPAY_KEY_SECRET is not set');
  }

  const ds = getDataSource();
  const appRepo = ds.getRepository(MerchantOnboardingApplication);
  const application = await appRepo.findOne({ where: { id: parsed.data.applicationId } });
  if (!application) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, 'Application not found');
  }
  if (!application.razorpayOrderId || application.razorpayOrderId !== parsed.data.razorpayOrderId) {
    throw new AppError(409, ErrorCodes.CONFLICT, 'Order mismatch');
  }

  const ok = verifyOrderSignature({
    orderId: parsed.data.razorpayOrderId,
    paymentId: parsed.data.razorpayPaymentId,
    signature: parsed.data.razorpaySignature,
    secret: env.RAZORPAY_KEY_SECRET,
  });
  if (!ok) {
    throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid payment signature');
  }

  application.status = 'SUBMITTED';
  await appRepo.save(application);

  res.json({ ok: true, status: application.status });
}

