import type { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { z } from 'zod';

import { loadEnv } from '../../../../config/env.js';
import { getDataSource } from '../../../../config/database.js';
import { MerchantKycDocument } from '../../../../entities/MerchantKycDocument.js';
import { MerchantOnboardingApplication } from '../../../../entities/MerchantOnboardingApplication.js';
import { SubscriptionPlan } from '../../../../entities/SubscriptionPlan.js';
import { Merchant } from '../../../../entities/Merchant.js';
import { Branch } from '../../../../entities/Branch.js';
import { MerchantUser } from '../../../../entities/MerchantUser.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';
import { getRazorpayClient, getRazorpayKeyId } from '../../../../lib/payments/razorpay.js';
import { sendEmail } from '../../../../lib/notifications/email.js';
import { hashPassword } from '../../../../lib/auth/password.js';

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

function emptyToUndefined(value: unknown): unknown {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
}

const optionalPublicImageUrl = z.preprocess(emptyToUndefined, z.string().url().optional());
const optionalImageFileName = z.preprocess(emptyToUndefined, z.string().min(1).optional());

const registerApplicationSchema = z
  .object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  category: z.string().min(1, 'Select a category'),
  contactName: z.string().min(2, 'Merchant name must be at least 2 characters'),
  contactEmail: z.string().email('Enter a valid email address'),
  contactPhone: z.string().min(10, 'Enter a valid mobile number').max(15, 'Enter a valid mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  pan: z
    .string()
    .trim()
    .transform((s) => s.toUpperCase())
    .optional()
    .refine((v) => !v || panRegex.test(v), 'Enter a valid PAN (e.g. ABCDE1234F)'),
  outletsCount: z.number().int().min(1, 'Outlets must be at least 1').max(200, 'Outlets cannot exceed 200'),
  gstin: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^[0-9A-Z]{15}$/.test(v), 'Enter a valid GSTIN (15 characters, A-Z and 0-9)'),
  addressLine1: z.string().min(5, 'Registered address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'Select state'),
  pinCode: z.string().min(6, 'Enter a valid PIN code'),
  mapsUrl: z.string().min(1, 'Google Maps link is required'),
  website: z.string().trim().max(512).optional(),
  googleBusinessUrl: z.string().trim().max(512).optional(),
  instagram: z.string().trim().max(200).optional(),
  facebook: z.string().trim().max(512).optional(),
  insideViewFileName: optionalImageFileName,
  insideViewUrl: optionalPublicImageUrl,
  outsideViewFileName: optionalImageFileName,
  outsideViewUrl: optionalPublicImageUrl,
  logoFileName: optionalImageFileName,
  logoUrl: optionalPublicImageUrl,
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
  })
  .superRefine((data, ctx) => {
    if (!data.logoUrl || !data.insideViewUrl || !data.outsideViewUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Public image URLs for logo, inside view, and outside view are required',
        path: ['logoUrl'],
      });
    }
    if (!data.logoFileName || !data.insideViewFileName || !data.outsideViewFileName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'File names for logo, inside view, and outside view are required',
        path: ['logoFileName'],
      });
    }
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
  const userRepo = ds.getRepository(MerchantUser);
  const existingUser = await userRepo.findOne({ where: { email: parsed.data.contactEmail.toLowerCase() } });
  if (existingUser) {
    throw new AppError(409, ErrorCodes.CONFLICT, 'Business email is already registered');
  }

  const planRepo = ds.getRepository(SubscriptionPlan);
  const selectedPlan = await planRepo.findOne({ where: { code: parsed.data.plan, isActive: true } });
  if (!selectedPlan) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Unknown plan');
  }

  const referenceNumber = createReferenceNumber();
  let liteRazorpayOrder: { id: string; amount?: number | string; currency?: string } | null = null;
  if (parsed.data.plan === 'LITE') {
    const paymentEnv = loadEnv();
    if (!paymentEnv.RAZORPAY_KEY_ID || !paymentEnv.RAZORPAY_KEY_SECRET) {
      throw new AppError(
        503,
        ErrorCodes.INTERNAL_ERROR,
        'Payment checkout is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET for the API.',
      );
    }
    const billingCycle = parsed.data.billingCycle ?? 'MONTHLY';
    const amountPaise = calcLiteTotalPaise({ outletsCount: parsed.data.outletsCount, billingCycle });
    try {
      liteRazorpayOrder = await getRazorpayClient().orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: referenceNumber,
        notes: {
          referenceNumber,
          plan: parsed.data.plan,
          billingCycle,
        },
      });
    } catch (err) {
      throw new AppError(
        502,
        ErrorCodes.INTERNAL_ERROR,
        'Could not start payment with Razorpay. Check API keys and Razorpay dashboard status.',
        err instanceof Error ? { message: err.message } : undefined,
      );
    }
  }

  const appRepo = ds.getRepository(MerchantOnboardingApplication);
  const passwordHash = await hashPassword({ password: parsed.data.password });
  const {
    password: _password,
    ...businessPayload
  } = parsed.data;
  void _password;

  const merchantRepo = ds.getRepository(Merchant);
  const branchRepo = ds.getRepository(Branch);

  const merchant = await merchantRepo.save(
    merchantRepo.create({
      legalName: parsed.data.businessName,
      tradingName: null,
      category: null,
      status: 'PENDING_APPROVAL',
      kycStatus: 'PENDING',
      subscriptionLimitedMode: true,
      primaryBusinessEmail: parsed.data.contactEmail.toLowerCase(),
      pan: parsed.data.pan ?? null,
      gstin: parsed.data.gstin ?? null,
      registeredAddress: {
        line1: parsed.data.addressLine1,
        city: parsed.data.city,
        state: parsed.data.state,
        pinCode: parsed.data.pinCode,
        mapsUrl: parsed.data.mapsUrl,
      },
      referralCode: null,
    }),
  );

  const headBranch = await branchRepo.save(
    branchRepo.create({
      merchant,
      name: 'Head Branch',
      isHeadBranch: true,
      status: 'ACTIVE',
      address: merchant.registeredAddress,
      googleMapsPlaceId: null,
      latitude: null,
      longitude: null,
      openingHours: null,
      socialLinks: {
        website: parsed.data.website,
        instagram: parsed.data.instagram,
        facebook: parsed.data.facebook,
        googleBusinessUrl: parsed.data.googleBusinessUrl,
      },
    }),
  );

  await userRepo.save(
    userRepo.create({
      merchant,
      branch: headBranch,
      email: parsed.data.contactEmail.toLowerCase(),
      passwordHash,
      role: 'MERCHANT_ADMIN',
      status: 'ACTIVE',
      lastLoginAt: null,
    }),
  );

  const application = appRepo.create({
    referenceNumber,
    status: parsed.data.plan === 'LITE' ? 'PAYMENT_PENDING' : 'SUBMITTED',
    businessPayload: {
      ...businessPayload,
      passwordHash,
      logoUrl: parsed.data.logoUrl,
      logoFileName: parsed.data.logoFileName,
      insideViewUrl: parsed.data.insideViewUrl,
      insideViewFileName: parsed.data.insideViewFileName,
      outsideViewUrl: parsed.data.outsideViewUrl,
      outsideViewFileName: parsed.data.outsideViewFileName,
    },
    selectedPlan,
    merchant,
    razorpayOrderId: liteRazorpayOrder?.id ?? null,
  });

  await appRepo.save(application);

  const env = loadEnv();
  if (parsed.data.contactEmail) {
    await sendEmail({
      to: [parsed.data.contactEmail.toLowerCase()],
      subject: `Perkzio: Application received (${application.referenceNumber})`,
      text: `We’ve received your merchant registration application.\n\nReference: ${application.referenceNumber}\nStatus: ${application.status}\n\nOur team will review it and get back to you.`,
    });
  }
  if (env.ADMIN_NOTIFICATION_EMAILS.length > 0) {
    await sendEmail({
      to: env.ADMIN_NOTIFICATION_EMAILS,
      subject: `New merchant application: ${application.referenceNumber}`,
      text: `A new merchant registration application has been submitted.\n\nReference: ${application.referenceNumber}\nPlan: ${parsed.data.plan}\nBusiness: ${parsed.data.businessName}\nEmail: ${parsed.data.contactEmail.toLowerCase()}\nPhone: ${parsed.data.contactPhone}`,
    });
  }

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

  if (parsed.data.plan === 'LITE' && liteRazorpayOrder) {
    res.status(201).json({
      ok: true,
      applicationId: application.id,
      referenceNumber: application.referenceNumber,
      status: application.status,
      checkout: {
        provider: 'RAZORPAY',
        keyId: getRazorpayKeyId(),
        orderId: liteRazorpayOrder.id,
        amount: liteRazorpayOrder.amount,
        currency: liteRazorpayOrder.currency,
      },
    });
    return;
  }

  res.status(201).json({ ok: true, applicationId: application.id, referenceNumber: application.referenceNumber, status: application.status });
}

