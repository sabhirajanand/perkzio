import type { Request, Response } from 'express';
import { z } from 'zod';

import { getDataSource } from '../../../../config/database.js';
import { Branch } from '../../../../entities/Branch.js';
import { MerchantBranchPhoto } from '../../../../entities/MerchantBranchPhoto.js';
import { MerchantBranchRequest } from '../../../../entities/MerchantBranchRequest.js';
import { MerchantOnboardingApplication } from '../../../../entities/MerchantOnboardingApplication.js';
import { MerchantUser } from '../../../../entities/MerchantUser.js';
import { PlatformStaff } from '../../../../entities/PlatformStaff.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';

const listQuery = z.object({
  status: z.string().optional(),
});

const rejectBody = z.object({
  reason: z.string().trim().max(2000).optional(),
});

function assertStaff(req: Request): string {
  const id = req.auth?.staff?.staffId;
  if (!id) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthorized');
  return id;
}

const listAllQuery = z.object({
  status: z.string().optional(),
  merchantId: z.string().uuid().optional(),
});

export async function listMerchantBranchRequestsForPlatform(req: Request, res: Response): Promise<void> {
  assertStaff(req);
  const merchantId = req.params.merchantId;
  if (!merchantId || !z.string().uuid().safeParse(merchantId).success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid merchant id');
  }
  const parsed = listQuery.safeParse(req.query);
  if (!parsed.success) throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid query', parsed.error.flatten());

  const qb = getDataSource()
    .getRepository(MerchantBranchRequest)
    .createQueryBuilder('r')
    .where('r.merchant_id = :merchantId', { merchantId })
    .orderBy('r.createdAt', 'DESC')
    .take(100);
  if (parsed.data.status) {
    qb.andWhere('r.status = :status', { status: parsed.data.status });
  }
  const rows = await qb.getMany();

  res.json({
    ok: true,
    requests: rows.map((r) => ({
      id: r.id,
      branchName: r.branchName,
      status: r.status,
      adminEmail: r.adminEmail,
      adminName: r.adminName,
      adminPhone: r.adminPhone,
      payload: r.payload,
      createdAt: r.createdAt.toISOString(),
      reviewedAt: r.reviewedAt?.toISOString() ?? null,
      rejectionReason: r.rejectionReason,
      resolvedBranchId: r.resolvedBranchId,
    })),
  });
}

export async function listAllMerchantBranchRequestsForPlatform(req: Request, res: Response): Promise<void> {
  assertStaff(req);
  const parsed = listAllQuery.safeParse(req.query);
  if (!parsed.success) throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid query', parsed.error.flatten());

  const qb = getDataSource()
    .getRepository(MerchantBranchRequest)
    .createQueryBuilder('r')
    .leftJoinAndSelect('r.merchant', 'm')
    .orderBy('r.createdAt', 'DESC')
    .take(200);

  if (parsed.data.status) qb.andWhere('r.status = :status', { status: parsed.data.status });
  if (parsed.data.merchantId) qb.andWhere('r.merchant_id = :merchantId', { merchantId: parsed.data.merchantId });

  const rows = await qb.getMany();

  res.json({
    ok: true,
    requests: rows.map((r) => ({
      id: r.id,
      merchant: r.merchant
        ? {
            id: r.merchant.id,
            legalName: r.merchant.legalName,
            primaryBusinessEmail: r.merchant.primaryBusinessEmail,
            status: r.merchant.status,
          }
        : null,
      branchName: r.branchName,
      status: r.status,
      adminEmail: r.adminEmail,
      adminName: r.adminName,
      adminPhone: r.adminPhone,
      createdAt: r.createdAt.toISOString(),
      reviewedAt: r.reviewedAt?.toISOString() ?? null,
      rejectionReason: r.rejectionReason,
      resolvedBranchId: r.resolvedBranchId,
    })),
  });
}

export async function getMerchantBranchRequestForPlatform(req: Request, res: Response): Promise<void> {
  assertStaff(req);
  const requestId = req.params.requestId;
  if (!requestId || !z.string().uuid().safeParse(requestId).success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request id');
  }

  const ds = getDataSource();
  const reqRepo = ds.getRepository(MerchantBranchRequest);
  const row = await reqRepo.findOne({ where: { id: requestId }, relations: { merchant: true, reviewedByStaff: true } });
  if (!row) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Request not found');

  const branchRepo = ds.getRepository(Branch);
  const headBranch = await branchRepo.findOne({ where: { merchant: { id: row.merchant.id }, isHeadBranch: true } });

  const appRepo = ds.getRepository(MerchantOnboardingApplication);
  const onboardingApplication = await appRepo.findOne({
    where: { merchant: { id: row.merchant.id } },
    order: { createdAt: 'DESC' },
  });

  res.json({
    ok: true,
    request: {
      id: row.id,
      merchant: row.merchant
        ? {
            id: row.merchant.id,
            legalName: row.merchant.legalName,
            primaryBusinessEmail: row.merchant.primaryBusinessEmail,
            status: row.merchant.status,
            kycStatus: row.merchant.kycStatus,
            registeredAddress: row.merchant.registeredAddress,
          }
        : null,
      branchName: row.branchName,
      status: row.status,
      adminEmail: row.adminEmail,
      adminName: row.adminName,
      adminPhone: row.adminPhone,
      payload: row.payload,
      createdAt: row.createdAt.toISOString(),
      reviewedAt: row.reviewedAt?.toISOString() ?? null,
      reviewedByStaff: row.reviewedByStaff
        ? { id: row.reviewedByStaff.id, email: row.reviewedByStaff.email, fullName: row.reviewedByStaff.fullName }
        : null,
      rejectionReason: row.rejectionReason,
      resolvedBranchId: row.resolvedBranchId,
    },
    headBranch: headBranch
      ? {
          id: headBranch.id,
          name: headBranch.name,
          status: headBranch.status,
          address: headBranch.address,
          socialLinks: headBranch.socialLinks,
          openingHours: headBranch.openingHours,
        }
      : null,
    onboardingApplication: onboardingApplication
      ? { id: onboardingApplication.id, referenceNumber: onboardingApplication.referenceNumber, businessPayload: onboardingApplication.businessPayload }
      : null,
  });
}

export async function approveMerchantBranchRequest(req: Request, res: Response): Promise<void> {
  const staffId = assertStaff(req);
  const requestId = req.params.requestId;
  if (!requestId || !z.string().uuid().safeParse(requestId).success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request id');
  }

  const ds = getDataSource();
  const reqRepo = ds.getRepository(MerchantBranchRequest);
  const row = await reqRepo.findOne({
    where: { id: requestId },
    relations: { merchant: true },
  });
  if (!row) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Request not found');
  if (row.status !== 'PENDING') {
    throw new AppError(409, ErrorCodes.CONFLICT, 'Request is not pending approval');
  }

  const payload = row.payload && typeof row.payload === 'object' ? (row.payload as Record<string, unknown>) : {};
  const line1 = typeof payload.addressLine1 === 'string' ? payload.addressLine1 : '';
  const city = typeof payload.city === 'string' ? payload.city : '';
  const state = typeof payload.state === 'string' ? payload.state : '';
  const pinCode = typeof payload.pinCode === 'string' ? payload.pinCode : '';
  const mapsUrl = typeof payload.mapsUrl === 'string' ? payload.mapsUrl : '';
  if (!line1 || !city || !state || !pinCode || !mapsUrl) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Branch request payload is incomplete');
  }

  const staffRef = await ds.getRepository(PlatformStaff).findOne({ where: { id: staffId } });
  if (!staffRef) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid staff');

  await ds.transaction(async (em) => {
    const bRepo = em.getRepository(Branch);
    const uRepo = em.getRepository(MerchantUser);
    const pRepo = em.getRepository(MerchantBranchPhoto);
    const rRepo = em.getRepository(MerchantBranchRequest);

    const branch = bRepo.create({
      merchant: row.merchant,
      name: row.branchName,
      isHeadBranch: false,
      status: 'ACTIVE',
      address: { line1, city, state, pinCode, mapsUrl },
      googleMapsPlaceId: typeof payload.googleMapsPlaceId === 'string' ? payload.googleMapsPlaceId : null,
      latitude: typeof payload.latitude === 'number' ? payload.latitude : null,
      longitude: typeof payload.longitude === 'number' ? payload.longitude : null,
      openingHours: payload.openingHours ?? null,
      socialLinks: {
        website: (typeof payload.website === 'string' && payload.website) || null,
        instagram: (typeof payload.instagram === 'string' && payload.instagram) || null,
        facebook: (typeof payload.facebook === 'string' && payload.facebook) || null,
        googleBusinessUrl: (typeof payload.googleBusinessUrl === 'string' && payload.googleBusinessUrl) || null,
      },
    });
    await bRepo.save(branch);

    const clash = await uRepo.findOne({
      where: { merchant: { id: row.merchant.id }, email: row.adminEmail },
    });
    if (clash) {
      throw new AppError(409, ErrorCodes.CONFLICT, 'A user with this email already exists for this merchant');
    }

    const admin = uRepo.create({
      merchant: row.merchant,
      branch,
      email: row.adminEmail,
      passwordHash: row.adminPasswordHash,
      role: 'BRANCH_ADMIN',
      status: 'ACTIVE',
      lastLoginAt: null,
      emailVerifiedAt: null,
    });
    await uRepo.save(admin);

    const inKey = typeof payload.insideViewKey === 'string' ? payload.insideViewKey : '';
    const outKey = typeof payload.outsideViewKey === 'string' ? payload.outsideViewKey : '';
    if (inKey) {
      await pRepo.save(pRepo.create({ branch, kind: 'INSIDE', s3Key: inKey, sortOrder: 0 }));
    }
    if (outKey) {
      await pRepo.save(pRepo.create({ branch, kind: 'OUTSIDE', s3Key: outKey, sortOrder: 1 }));
    }

    row.status = 'APPROVED';
    row.reviewedAt = new Date();
    row.reviewedByStaff = staffRef;
    row.resolvedBranchId = branch.id;
    await rRepo.save(row);
  });

  res.json({ ok: true, message: 'Branch approved and branch admin activated' });
}

export async function rejectMerchantBranchRequest(req: Request, res: Response): Promise<void> {
  const staffId = assertStaff(req);
  const requestId = req.params.requestId;
  if (!requestId || !z.string().uuid().safeParse(requestId).success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request id');
  }

  const parsed = rejectBody.safeParse(req.body ?? {});
  if (!parsed.success) throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid body', parsed.error.flatten());

  const ds = getDataSource();
  const reqRepo = ds.getRepository(MerchantBranchRequest);
  const row = await reqRepo.findOne({ where: { id: requestId } });
  if (!row) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Request not found');
  if (row.status !== 'PENDING') {
    throw new AppError(409, ErrorCodes.CONFLICT, 'Request is not pending approval');
  }

  const staffRef = await ds.getRepository(PlatformStaff).findOne({ where: { id: staffId } });
  if (!staffRef) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid staff');

  row.status = 'REJECTED';
  row.reviewedAt = new Date();
  row.reviewedByStaff = staffRef;
  row.rejectionReason = parsed.data.reason?.trim() || null;
  await reqRepo.save(row);

  res.json({ ok: true, message: 'Branch request rejected' });
}
