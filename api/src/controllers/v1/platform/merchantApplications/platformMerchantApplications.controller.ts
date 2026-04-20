import type { Request, Response } from 'express';
import { z } from 'zod';

import { getDataSource } from '../../../../config/database.js';
import { MerchantOnboardingApplication } from '../../../../entities/MerchantOnboardingApplication.js';
import { Merchant } from '../../../../entities/Merchant.js';
import { PlatformStaff } from '../../../../entities/PlatformStaff.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';
import { sendEmail } from '../../../../lib/notifications/email.js';

const listSchema = z.object({
  status: z.string().optional(),
  q: z.string().trim().min(1).optional(),
  planCode: z.string().trim().min(1).optional(),
  createdFrom: z.string().trim().min(1).optional(),
  createdTo: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

const updateSchema = z.object({
  businessName: z.string().min(2).optional(),
  category: z.string().min(1).optional(),
  contactName: z.string().min(2).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(10).max(15).optional(),
  pan: z.string().min(1).optional(),
  gstin: z.string().optional(),
  addressLine1: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  pinCode: z.string().min(1).optional(),
  mapsUrl: z.string().min(1).optional(),
  plan: z.enum(['LITE', 'GROWTH', 'PRO']).optional(),
  billingCycle: z.string().min(1).optional(),
  outletsCount: z.number().int().min(1).max(200).optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  googleBusinessUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  logoFileName: z.string().optional(),
  insideViewUrl: z.string().optional(),
  insideViewFileName: z.string().optional(),
  outsideViewUrl: z.string().optional(),
  outsideViewFileName: z.string().optional(),
});

function pickSummary(app: MerchantOnboardingApplication) {
  const payload = app.businessPayload && typeof app.businessPayload === 'object' ? (app.businessPayload as Record<string, unknown>) : {};
  return {
    id: app.id,
    referenceNumber: app.referenceNumber,
    status: app.status,
    createdAt: app.createdAt,
    businessName: typeof payload.businessName === 'string' ? payload.businessName : null,
    contactEmail: typeof payload.contactEmail === 'string' ? payload.contactEmail : null,
    contactPhone: typeof payload.contactPhone === 'string' ? payload.contactPhone : null,
    plan: typeof payload.plan === 'string' ? payload.plan : null,
    outletsCount: typeof payload.outletsCount === 'number' ? payload.outletsCount : null,
  };
}

function sanitizeBusinessPayloadForAdmin(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload;
  const next = { ...(payload as Record<string, unknown>) };
  delete next.passwordHash;
  delete next.password;
  return next;
}

function serializeSelectedPlan(plan: MerchantOnboardingApplication['selectedPlan']) {
  if (!plan) return null;
  return {
    id: plan.id,
    code: plan.code,
    name: plan.name,
    maxLoyaltyCards: plan.maxLoyaltyCards,
    maxActiveCustomers: plan.maxActiveCustomers,
    maxMonthlyPushNotifications: plan.maxMonthlyPushNotifications,
    maxConcurrentSpecialOffers: plan.maxConcurrentSpecialOffers,
    allowedCampaignTypes: plan.allowedCampaignTypes,
    analyticsTier: plan.analyticsTier,
    supportSlaTier: plan.supportSlaTier,
    qrStandeeEntitlement: plan.qrStandeeEntitlement,
    isActive: plan.isActive,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

function serializeLinkedMerchant(merchant: MerchantOnboardingApplication['merchant']) {
  if (!merchant) return null;
  return {
    id: merchant.id,
    legalName: merchant.legalName,
    tradingName: merchant.tradingName,
    status: merchant.status,
    kycStatus: merchant.kycStatus,
    subscriptionLimitedMode: merchant.subscriptionLimitedMode,
    primaryBusinessEmail: merchant.primaryBusinessEmail,
    pan: merchant.pan,
    gstin: merchant.gstin,
    registeredAddress: merchant.registeredAddress,
    referralCode: merchant.referralCode,
    createdAt: merchant.createdAt,
    updatedAt: merchant.updatedAt,
    deletedAt: merchant.deletedAt,
  };
}

function serializeReviewer(staff: MerchantOnboardingApplication['reviewedByStaff']) {
  if (!staff) return null;
  return { id: staff.id, email: staff.email, fullName: staff.fullName };
}

export async function listMerchantApplications(req: Request, res: Response): Promise<void> {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());

  const ds = getDataSource();
  const repo = ds.getRepository(MerchantOnboardingApplication);

  const qb = repo.createQueryBuilder('a').orderBy('a.createdAt', 'DESC');
  if (parsed.data.status) qb.where('a.status = :status', { status: parsed.data.status });

  if (parsed.data.q) {
    qb.andWhere(
      "(a.referenceNumber ILIKE :q OR (a.businessPayload->>'businessName') ILIKE :q OR (a.businessPayload->>'contactEmail') ILIKE :q OR (a.businessPayload->>'contactPhone') ILIKE :q)",
      { q: `%${parsed.data.q}%` },
    );
  }
  if (parsed.data.planCode) {
    qb.andWhere("(a.businessPayload->>'plan') = :plan", { plan: parsed.data.planCode });
  }
  if (parsed.data.createdFrom) {
    const from = new Date(parsed.data.createdFrom);
    if (!Number.isNaN(from.getTime())) qb.andWhere('a.createdAt >= :createdFrom', { createdFrom: from.toISOString() });
  }
  if (parsed.data.createdTo) {
    const to = new Date(parsed.data.createdTo);
    if (!Number.isNaN(to.getTime())) {
      const endExclusive = new Date(to);
      endExclusive.setDate(endExclusive.getDate() + 1);
      qb.andWhere('a.createdAt < :createdTo', { createdTo: endExclusive.toISOString() });
    }
  }

  const total = await qb.clone().orderBy().getCount();
  const rows = await qb.take(parsed.data.limit).skip(parsed.data.offset).getMany();
  res.json({ ok: true, total, limit: parsed.data.limit, offset: parsed.data.offset, applications: rows.map(pickSummary) });
}

export async function getMerchantApplication(req: Request, res: Response): Promise<void> {
  const applicationId = z.string().uuid().parse(req.params.applicationId);
  const ds = getDataSource();
  const repo = ds.getRepository(MerchantOnboardingApplication);
  const application = await repo.findOne({ where: { id: applicationId }, relations: { selectedPlan: true, merchant: true, reviewedByStaff: true } });
  if (!application) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Application not found');
  res.json({
    ok: true,
    application: {
      id: application.id,
      referenceNumber: application.referenceNumber,
      status: application.status,
      businessPayload: sanitizeBusinessPayloadForAdmin(application.businessPayload),
      razorpayOrderId: application.razorpayOrderId,
      reviewedAt: application.reviewedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      selectedPlan: serializeSelectedPlan(application.selectedPlan),
      merchant: serializeLinkedMerchant(application.merchant),
      reviewedByStaff: serializeReviewer(application.reviewedByStaff),
    },
  });
}

export async function updateMerchantApplication(req: Request, res: Response): Promise<void> {
  const applicationId = z.string().uuid().parse(req.params.applicationId);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());

  const ds = getDataSource();
  const repo = ds.getRepository(MerchantOnboardingApplication);
  const application = await repo.findOne({ where: { id: applicationId } });
  if (!application) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Application not found');
  const isSuperAdmin = req.auth?.userType === 'SUPERADMIN';
  if (!isSuperAdmin && application.status !== 'SUBMITTED' && application.status !== 'PAYMENT_PENDING') {
    throw new AppError(409, ErrorCodes.CONFLICT, 'Only pending applications can be edited');
  }

  const existingPayload = application.businessPayload && typeof application.businessPayload === 'object' ? (application.businessPayload as Record<string, unknown>) : {};
  const nextPayload = { ...existingPayload, ...parsed.data };
  if (typeof parsed.data.contactEmail === 'string') nextPayload.contactEmail = parsed.data.contactEmail.toLowerCase();
  application.businessPayload = nextPayload;
  await repo.save(application);
  res.json({ ok: true, application });
}

export async function approveMerchantApplication(req: Request, res: Response): Promise<void> {
  const applicationId = z.string().uuid().parse(req.params.applicationId);
  const staffId = req.auth?.staff?.staffId ?? null;
  if (!staffId) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Missing staff session');

  const ds = getDataSource();
  const appRepo = ds.getRepository(MerchantOnboardingApplication);
  const staffRepo = ds.getRepository(PlatformStaff);

  const application = await appRepo.findOne({ where: { id: applicationId }, relations: { selectedPlan: true, merchant: true } });
  if (!application) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Application not found');
  if (application.status !== 'SUBMITTED') {
    throw new AppError(409, ErrorCodes.CONFLICT, 'Only SUBMITTED applications can be approved');
  }

  const reviewer = await staffRepo.findOne({ where: { id: staffId } });
  if (!reviewer) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid staff session');

  if (!application.merchant) {
    throw new AppError(409, ErrorCodes.CONFLICT, 'Merchant record is missing for this application');
  }

  const merchantRepo = ds.getRepository(Merchant);
  application.merchant.status = 'ACTIVE';
  application.merchant.subscriptionLimitedMode = false;
  await merchantRepo.save(application.merchant);

  application.status = 'APPROVED';
  application.reviewedByStaff = reviewer;
  application.reviewedAt = new Date();
  await appRepo.save(application);

  const payload = application.businessPayload && typeof application.businessPayload === 'object' ? (application.businessPayload as Record<string, unknown>) : {};
  const contactEmail = typeof payload.contactEmail === 'string' ? payload.contactEmail.toLowerCase() : null;
  await sendEmail({
    to: contactEmail ? [contactEmail] : [],
    subject: `Perkzio: Application approved (${application.referenceNumber})`,
    text: `Your merchant registration has been approved.\n\nReference: ${application.referenceNumber}\n\nYour portal access has been unlocked.`,
  });

  res.json({ ok: true, status: application.status, merchantId: application.merchant.id });
}

export async function rejectMerchantApplication(req: Request, res: Response): Promise<void> {
  const applicationId = z.string().uuid().parse(req.params.applicationId);
  const staffId = req.auth?.staff?.staffId ?? null;
  if (!staffId) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Missing staff session');

  const ds = getDataSource();
  const appRepo = ds.getRepository(MerchantOnboardingApplication);
  const staffRepo = ds.getRepository(PlatformStaff);

  const application = await appRepo.findOne({ where: { id: applicationId } });
  if (!application) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Application not found');
  if (application.status !== 'SUBMITTED') {
    throw new AppError(409, ErrorCodes.CONFLICT, 'Only SUBMITTED applications can be rejected');
  }

  const reviewer = await staffRepo.findOne({ where: { id: staffId } });
  if (!reviewer) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid staff session');

  application.status = 'REJECTED';
  application.reviewedByStaff = reviewer;
  application.reviewedAt = new Date();
  await appRepo.save(application);

  if (application.merchant) {
    const merchantRepo = ds.getRepository(Merchant);
    application.merchant.status = 'INACTIVE';
    await merchantRepo.save(application.merchant);
  }

  const payload = application.businessPayload && typeof application.businessPayload === 'object' ? (application.businessPayload as Record<string, unknown>) : {};
  const contactEmail = typeof payload.contactEmail === 'string' ? payload.contactEmail.toLowerCase() : null;
  if (contactEmail) {
    await sendEmail({
      to: [contactEmail],
      subject: `Perkzio: Application rejected (${application.referenceNumber})`,
      text: `Your merchant registration application has been rejected.\n\nReference: ${application.referenceNumber}\n\nIf you believe this is a mistake, please contact support.`,
    });
  }

  res.json({ ok: true, status: application.status });
}

