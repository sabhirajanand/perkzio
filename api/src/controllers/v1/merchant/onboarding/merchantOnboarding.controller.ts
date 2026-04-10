import type { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { z } from 'zod';

import { loadEnv } from '../../../../config/env.js';
import { getDataSource } from '../../../../config/database.js';
import { MerchantKycDocument } from '../../../../entities/MerchantKycDocument.js';
import { MerchantOnboardingApplication } from '../../../../entities/MerchantOnboardingApplication.js';
import { OtpChallenge } from '../../../../entities/OtpChallenge.js';
import { SubscriptionPlan } from '../../../../entities/SubscriptionPlan.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';
import { getRazorpayClient, getRazorpayKeyId } from '../../../../lib/payments/razorpay.js';

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const registerApplicationSchema = z.object({
  businessName: z.string().min(2),
  category: z.string().min(1),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(10).max(15),
  pan: z
    .string()
    .trim()
    .transform((s) => s.toUpperCase())
    .pipe(z.string().regex(panRegex, 'Invalid PAN')),
  outletsCount: z.number().int().min(1).max(200),
  gstin: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^[0-9A-Z]{15}$/.test(v), 'GSTIN must be 15 characters (A-Z, 0-9)'),
  addressLine1: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pinCode: z.string().min(6),
  mapsUrl: z.string().min(1),
  website: z.string().trim().max(512).optional(),
  googleBusinessUrl: z.string().trim().max(512).optional(),
  instagram: z.string().trim().max(200).optional(),
  facebook: z.string().trim().max(512).optional(),
  gstCertFileName: z.string().optional(),
  panCardFileName: z.string().optional(),
  addressProofFileName: z.string().optional(),
  shopPhotoFileName: z.string().optional(),
  gstCertUploadKey: z.string().optional(),
  panCardUploadKey: z.string().optional(),
  addressProofUploadKey: z.string().optional(),
  shopPhotoUploadKey: z.string().optional(),
  plan: z.enum(['LITE', 'GROWTH', 'PRO']),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']).optional(),
  otpChallengeId: z.string().uuid(),
});

function createReferenceNumber(): string {
  const suffix = randomBytes(6).toString('hex').toUpperCase();
  return `MP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${suffix}`;
}

function calcLiteTotalPaise(input: { outletsCount: number; billingCycle: 'MONTHLY' | 'ANNUAL' }): number {
  const perOutlet = input.billingCycle === 'ANNUAL' ? 5990 : 599;
  const base = perOutlet * input.outletsCount;
  const gst = Math.round(base * 0.18);
  return (base + gst) * 100;
}

export async function submitMerchantOnboardingApplication(req: Request, res: Response): Promise<void> {
  const parsed = registerApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());
  }

  const ds = getDataSource();
  const otpRepo = ds.getRepository(OtpChallenge);
  const otp = await otpRepo.findOne({ where: { id: parsed.data.otpChallengeId } });
  if (!otp || !otp.consumedAt || !otp.expiresAt || otp.expiresAt.getTime() < Date.now()) {
    throw new AppError(401, ErrorCodes.UNAUTHENTICATED, 'Phone verification required');
  }

  const planRepo = ds.getRepository(SubscriptionPlan);
  const selectedPlan = await planRepo.findOne({ where: { code: parsed.data.plan, isActive: true } });
  if (!selectedPlan) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Unknown plan');
  }

  const appRepo = ds.getRepository(MerchantOnboardingApplication);
  const { otpChallengeId: _otpChallengeId, ...businessPayload } = parsed.data;
  void _otpChallengeId;
  const application = appRepo.create({
    referenceNumber: createReferenceNumber(),
    status: parsed.data.plan === 'LITE' ? 'PAYMENT_PENDING' : 'SUBMITTED',
    businessPayload,
    selectedPlan,
  });

  await appRepo.save(application);

  const env = loadEnv();
  const kycRepo = ds.getRepository(MerchantKycDocument);
  const possibleUploads: Array<{ documentType: string; s3Key: string | undefined }> = [
    { documentType: 'GST_CERT', s3Key: parsed.data.gstCertUploadKey ?? parsed.data.gstCertFileName },
    { documentType: 'PAN_CARD', s3Key: parsed.data.panCardUploadKey ?? parsed.data.panCardFileName },
    { documentType: 'ADDRESS_PROOF', s3Key: parsed.data.addressProofUploadKey ?? parsed.data.addressProofFileName },
    { documentType: 'SHOP_PHOTO', s3Key: parsed.data.shopPhotoUploadKey ?? parsed.data.shopPhotoFileName },
  ];
  const bucket = env.KYC_DOCS_BUCKET;
  if (bucket) {
    for (const u of possibleUploads) {
      if (!u.s3Key) continue;
      if (!u.s3Key.includes('/')) continue;
      await kycRepo.save(
        kycRepo.create({
          merchant: null,
          application,
          documentType: u.documentType,
          s3Bucket: bucket,
          s3Key: u.s3Key,
          contentType: null,
          sizeBytes: null,
          uploadedAt: new Date(),
        }),
      );
    }
  }

  if (parsed.data.plan === 'LITE') {
    const billingCycle = parsed.data.billingCycle ?? 'MONTHLY';
    const amountPaise = calcLiteTotalPaise({ outletsCount: parsed.data.outletsCount, billingCycle });
    const order = await getRazorpayClient().orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: application.referenceNumber,
      notes: {
        applicationId: application.id,
        referenceNumber: application.referenceNumber,
        plan: parsed.data.plan,
        billingCycle,
      },
    });

    application.razorpayOrderId = order.id;
    await appRepo.save(application);

    res.status(201).json({
      ok: true,
      applicationId: application.id,
      referenceNumber: application.referenceNumber,
      status: application.status,
      checkout: {
        provider: 'RAZORPAY',
        keyId: getRazorpayKeyId(),
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    });
    return;
  }

  res.status(201).json({ ok: true, applicationId: application.id, referenceNumber: application.referenceNumber, status: application.status });
}

