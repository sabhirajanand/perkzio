import type { Request, Response } from 'express';
import { z } from 'zod';

import { getDataSource } from '../../../../config/database.js';
import { Branch } from '../../../../entities/Branch.js';
import { Merchant } from '../../../../entities/Merchant.js';
import { MerchantOnboardingApplication } from '../../../../entities/MerchantOnboardingApplication.js';
import { MerchantSubscription } from '../../../../entities/MerchantSubscription.js';
import { MerchantUser } from '../../../../entities/MerchantUser.js';
import { MerchantBranchRequest } from '../../../../entities/MerchantBranchRequest.js';
import { SubscriptionPlan } from '../../../../entities/SubscriptionPlan.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';

const listSchema = z.object({
  q: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
  planCode: z.string().trim().min(1).optional(),
  createdFrom: z.string().trim().min(1).optional(),
  createdTo: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function listBranches(req: Request, res: Response): Promise<void> {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());

  const ds = getDataSource();

  const qb = ds
    .getRepository(Branch)
    .createQueryBuilder('b')
    .innerJoin(Merchant, 'm', 'm.id = b.merchant_id')
    .leftJoin(MerchantSubscription, 'ms', 'ms.merchant_id = m.id')
    .leftJoin(SubscriptionPlan, 'p', 'p.id = ms.plan_id')
    .leftJoin(
      (subQb) =>
        subQb
          .select('oa.merchant_id', 'merchant_id')
          .addSelect('oa.selected_plan_id', 'selected_plan_id')
          .from(MerchantOnboardingApplication, 'oa')
          .distinctOn(['oa.merchant_id'])
          .orderBy('oa.merchant_id', 'ASC')
          .addOrderBy('oa.created_at', 'DESC'),
      'oa_latest',
      'oa_latest.merchant_id = m.id',
    )
    .leftJoin(SubscriptionPlan, 'op', 'op.id = oa_latest.selected_plan_id')
    .leftJoin(MerchantUser, 'u', "u.branch_id = b.id AND u.role = 'BRANCH_ADMIN'")
    .orderBy('b.createdAt', 'DESC');

  if (parsed.data.q) {
    qb.where(
      '(b.name ILIKE :q OR m.legalName ILIKE :q OR m.primaryBusinessEmail ILIKE :q OR u.email ILIKE :q)',
      { q: `%${parsed.data.q}%` },
    );
  }
  if (parsed.data.status) {
    qb.andWhere('b.status = :status', { status: parsed.data.status });
  }
  if (parsed.data.planCode) {
    qb.andWhere('(p.code = :planCode OR op.code = :planCode)', { planCode: parsed.data.planCode });
  }
  if (parsed.data.createdFrom) {
    const from = new Date(parsed.data.createdFrom);
    if (!Number.isNaN(from.getTime())) qb.andWhere('b.createdAt >= :createdFrom', { createdFrom: from.toISOString() });
  }
  if (parsed.data.createdTo) {
    const to = new Date(parsed.data.createdTo);
    if (!Number.isNaN(to.getTime())) {
      const endExclusive = new Date(to);
      endExclusive.setDate(endExclusive.getDate() + 1);
      qb.andWhere('b.createdAt < :createdTo', { createdTo: endExclusive.toISOString() });
    }
  }

  const total = await qb.clone().orderBy().getCount();

  const rows = await qb
    .select('b.id', 'id')
    .addSelect('b.name', 'name')
    .addSelect('b.status', 'status')
    .addSelect('b.isHeadBranch', 'isHeadBranch')
    .addSelect('b.address', 'address')
    .addSelect('b.createdAt', 'createdAt')
    .addSelect('m.id', 'merchantId')
    .addSelect('m.legalName', 'merchantLegalName')
    .addSelect('m.primaryBusinessEmail', 'merchantEmail')
    .addSelect('u.email', 'adminEmail')
    .addSelect('COALESCE(p.code, op.code)', 'planCode')
    .addSelect('COALESCE(p.name, op.name)', 'planName')
    .take(parsed.data.limit)
    .skip(parsed.data.offset)
    .getRawMany<{
      id: string;
      name: string;
      status: string;
      isHeadBranch: boolean;
      address: unknown;
      createdAt: string;
      merchantId: string;
      merchantLegalName: string;
      merchantEmail: string | null;
      adminEmail: string | null;
      planCode: string | null;
      planName: string | null;
    }>();

  res.json({
    ok: true,
    total,
    limit: parsed.data.limit,
    offset: parsed.data.offset,
    branches: rows.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      isHeadBranch: r.isHeadBranch,
      address: r.address ?? null,
      createdAt: r.createdAt,
      merchant: {
        id: r.merchantId,
        legalName: r.merchantLegalName,
        primaryBusinessEmail: r.merchantEmail,
      },
      adminEmail: r.adminEmail,
      plan: r.planCode ? { code: r.planCode, name: r.planName ?? r.planCode } : null,
    })),
  });
}

export async function getBranch(req: Request, res: Response): Promise<void> {
  const branchId = z.string().uuid().parse(req.params.branchId);
  const ds = getDataSource();

  const qb = ds
    .getRepository(Branch)
    .createQueryBuilder('b')
    .innerJoin(Merchant, 'm', 'm.id = b.merchant_id')
    .leftJoin(MerchantSubscription, 'ms', 'ms.merchant_id = m.id')
    .leftJoin(SubscriptionPlan, 'p', 'p.id = ms.plan_id')
    .leftJoin(
      (subQb) =>
        subQb
          .select('oa.merchant_id', 'merchant_id')
          .addSelect('oa.selected_plan_id', 'selected_plan_id')
          .from(MerchantOnboardingApplication, 'oa')
          .distinctOn(['oa.merchant_id'])
          .orderBy('oa.merchant_id', 'ASC')
          .addOrderBy('oa.created_at', 'DESC'),
      'oa_latest',
      'oa_latest.merchant_id = m.id',
    )
    .leftJoin(SubscriptionPlan, 'op', 'op.id = oa_latest.selected_plan_id')
    .leftJoin(MerchantUser, 'u', "u.branch_id = b.id AND u.role = 'BRANCH_ADMIN'")
    .where('b.id = :branchId', { branchId });

  const row = await qb
    .select('b.id', 'id')
    .addSelect('b.name', 'name')
    .addSelect('b.status', 'status')
    .addSelect('b.isHeadBranch', 'isHeadBranch')
    .addSelect('b.address', 'address')
    .addSelect('b.googleMapsPlaceId', 'googleMapsPlaceId')
    .addSelect('b.latitude', 'latitude')
    .addSelect('b.longitude', 'longitude')
    .addSelect('b.openingHours', 'openingHours')
    .addSelect('b.socialLinks', 'socialLinks')
    .addSelect('b.createdAt', 'createdAt')
    .addSelect('b.updatedAt', 'updatedAt')
    .addSelect('m.id', 'merchantId')
    .addSelect('m.legalName', 'merchantLegalName')
    .addSelect('m.primaryBusinessEmail', 'merchantEmail')
    .addSelect('u.email', 'adminEmail')
    .addSelect('COALESCE(p.code, op.code)', 'planCode')
    .addSelect('COALESCE(p.name, op.name)', 'planName')
    .getRawOne<{
      id: string;
      name: string;
      status: string;
      isHeadBranch: boolean;
      address: unknown;
      googleMapsPlaceId: string | null;
      latitude: number | null;
      longitude: number | null;
      openingHours: unknown;
      socialLinks: unknown;
      createdAt: string;
      updatedAt: string;
      merchantId: string;
      merchantLegalName: string;
      merchantEmail: string | null;
      adminEmail: string | null;
      planCode: string | null;
      planName: string | null;
    }>();

  if (!row) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Branch not found');

  const branchRequest = await ds.getRepository(MerchantBranchRequest).findOne({
    where: { resolvedBranchId: branchId },
    order: { reviewedAt: 'DESC', createdAt: 'DESC' },
  });

  res.json({
    ok: true,
    branch: {
      id: row.id,
      name: row.name,
      status: row.status,
      isHeadBranch: row.isHeadBranch,
      address: row.address ?? null,
      googleMapsPlaceId: row.googleMapsPlaceId,
      latitude: row.latitude,
      longitude: row.longitude,
      openingHours: row.openingHours ?? null,
      socialLinks: row.socialLinks ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      merchant: { id: row.merchantId, legalName: row.merchantLegalName, primaryBusinessEmail: row.merchantEmail },
      adminEmail: row.adminEmail,
      plan: row.planCode ? { code: row.planCode, name: row.planName ?? row.planCode } : null,
    },
    branchRequest: branchRequest
      ? {
          id: branchRequest.id,
          status: branchRequest.status,
          branchName: branchRequest.branchName,
          adminName: branchRequest.adminName,
          adminEmail: branchRequest.adminEmail,
          adminPhone: branchRequest.adminPhone,
          payload: branchRequest.payload,
          createdAt: branchRequest.createdAt.toISOString(),
          reviewedAt: branchRequest.reviewedAt?.toISOString() ?? null,
          rejectionReason: branchRequest.rejectionReason,
        }
      : null,
  });
}

