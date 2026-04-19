import type { Request, Response } from 'express';
import { z } from 'zod';

import { getDataSource } from '../../../../config/database.js';
import { Branch } from '../../../../entities/Branch.js';
import { Merchant } from '../../../../entities/Merchant.js';
import { MerchantOnboardingApplication } from '../../../../entities/MerchantOnboardingApplication.js';
import { SubscriptionPlan } from '../../../../entities/SubscriptionPlan.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';

const listSchema = z.object({
  q: z.string().trim().min(1).optional(),
});

export async function listMerchants(req: Request, res: Response): Promise<void> {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());

  const ds = getDataSource();
  const repo = ds.getRepository(Merchant);
  const qb = repo.createQueryBuilder('m').orderBy('m.createdAt', 'DESC').take(100);
  if (parsed.data.q) {
    qb.where('m.legalName ILIKE :q OR m.primaryBusinessEmail ILIKE :q', { q: `%${parsed.data.q}%` });
  }
  const merchants = await qb.getMany();

  res.json({
    ok: true,
    merchants: merchants.map((m) => ({
      id: m.id,
      legalName: m.legalName,
      status: m.status,
      kycStatus: m.kycStatus,
      primaryBusinessEmail: m.primaryBusinessEmail,
      createdAt: m.createdAt,
    })),
  });
}

function sanitizeOnboardingBusinessPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload;
  const next = { ...(payload as Record<string, unknown>) };
  delete next.passwordHash;
  delete next.password;
  return next;
}

function serializeApplicationReviewer(staff: MerchantOnboardingApplication['reviewedByStaff']) {
  if (!staff) return null;
  return { id: staff.id, email: staff.email, fullName: staff.fullName };
}

function serializeOnboardingPlan(plan: SubscriptionPlan | null) {
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

export async function getMerchant(req: Request, res: Response): Promise<void> {
  const merchantId = z.string().uuid().parse(req.params.merchantId);
  const ds = getDataSource();
  const repo = ds.getRepository(Merchant);
  const merchant = await repo.findOne({ where: { id: merchantId }, relations: { category: true } });
  if (!merchant) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Merchant not found');

  const branchRepo = ds.getRepository(Branch);
  const headBranch = await branchRepo.findOne({
    where: { merchant: { id: merchantId }, isHeadBranch: true },
  });

  const appRepo = ds.getRepository(MerchantOnboardingApplication);
  const onboardingApplication = await appRepo.findOne({
    where: { merchant: { id: merchantId } },
    order: { createdAt: 'DESC' },
    relations: { selectedPlan: true, reviewedByStaff: true },
  });

  res.json({
    ok: true,
    merchant: {
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
      category: merchant.category
        ? { id: merchant.category.id, name: merchant.category.name, slug: merchant.category.slug }
        : null,
    },
    headBranch: headBranch
      ? {
          id: headBranch.id,
          name: headBranch.name,
          status: headBranch.status,
          isHeadBranch: headBranch.isHeadBranch,
          address: headBranch.address,
          socialLinks: headBranch.socialLinks,
          openingHours: headBranch.openingHours,
          googleMapsPlaceId: headBranch.googleMapsPlaceId,
          latitude: headBranch.latitude,
          longitude: headBranch.longitude,
          createdAt: headBranch.createdAt,
          updatedAt: headBranch.updatedAt,
        }
      : null,
    onboardingApplication: onboardingApplication
      ? {
          id: onboardingApplication.id,
          referenceNumber: onboardingApplication.referenceNumber,
          status: onboardingApplication.status,
          createdAt: onboardingApplication.createdAt,
          updatedAt: onboardingApplication.updatedAt,
          reviewedAt: onboardingApplication.reviewedAt,
          reviewedByStaff: serializeApplicationReviewer(onboardingApplication.reviewedByStaff),
          razorpayOrderId: onboardingApplication.razorpayOrderId,
          businessPayload: sanitizeOnboardingBusinessPayload(onboardingApplication.businessPayload),
          selectedPlan: serializeOnboardingPlan(onboardingApplication.selectedPlan),
        }
      : null,
  });
}

const updateMerchantSchema = z.object({
  legalName: z.string().min(2).optional(),
  tradingName: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  kycStatus: z.string().min(1).optional(),
  subscriptionLimitedMode: z.boolean().optional(),
  primaryBusinessEmail: z.string().email().optional().nullable(),
  pan: z.string().min(1).optional().nullable(),
  gstin: z.string().optional().nullable(),
  registeredAddress: z.unknown().optional().nullable(),
});

export async function updateMerchant(req: Request, res: Response): Promise<void> {
  const merchantId = z.string().uuid().parse(req.params.merchantId);
  const parsed = updateMerchantSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());

  const ds = getDataSource();
  const repo = ds.getRepository(Merchant);
  const merchant = await repo.findOne({ where: { id: merchantId } });
  if (!merchant) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Merchant not found');

  if (typeof parsed.data.legalName === 'string') merchant.legalName = parsed.data.legalName;
  if ('tradingName' in parsed.data) merchant.tradingName = parsed.data.tradingName ?? null;
  if (typeof parsed.data.status === 'string') merchant.status = parsed.data.status;
  if (typeof parsed.data.kycStatus === 'string') merchant.kycStatus = parsed.data.kycStatus;
  if (typeof parsed.data.subscriptionLimitedMode === 'boolean') merchant.subscriptionLimitedMode = parsed.data.subscriptionLimitedMode;
  if ('primaryBusinessEmail' in parsed.data) {
    merchant.primaryBusinessEmail = parsed.data.primaryBusinessEmail ? parsed.data.primaryBusinessEmail.toLowerCase() : null;
  }
  if ('pan' in parsed.data) merchant.pan = parsed.data.pan ?? null;
  if ('gstin' in parsed.data) merchant.gstin = parsed.data.gstin ?? null;
  if ('registeredAddress' in parsed.data) merchant.registeredAddress = parsed.data.registeredAddress ?? null;

  await repo.save(merchant);
  res.json({ ok: true, merchantId: merchant.id });
}

export async function deleteMerchant(req: Request, res: Response): Promise<void> {
  const merchantId = z.string().uuid().parse(req.params.merchantId);
  const ds = getDataSource();
  const repo = ds.getRepository(Merchant);
  const merchant = await repo.findOne({ where: { id: merchantId } });
  if (!merchant) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Merchant not found');

  merchant.status = 'INACTIVE';
  await repo.save(merchant);
  await repo.softRemove(merchant);

  res.json({ ok: true });
}

