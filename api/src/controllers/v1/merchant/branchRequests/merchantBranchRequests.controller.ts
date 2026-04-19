import type { Request, Response } from 'express';
import { z } from 'zod';

import { getDataSource } from '../../../../config/database.js';
import { Merchant } from '../../../../entities/Merchant.js';
import { MerchantBranchRequest } from '../../../../entities/MerchantBranchRequest.js';
import { MerchantUser } from '../../../../entities/MerchantUser.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';
import { hashPassword } from '../../../../lib/auth/password.js';

const dayKey = z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

const openingHourRow = z.object({
  day: dayKey,
  open: z.boolean(),
  from: z.string(),
  to: z.string(),
});

const submitBranchRequestBody = z
  .object({
    branchName: z.string().trim().min(2).max(255),
    mapsUrl: z
      .string()
      .min(1, 'Google Maps link is required')
      .refine((v) => /^https?:\/\/.+/i.test(v), 'Enter a valid URL'),
    addressLine1: z.string().trim().min(5, 'Address must be at least 5 characters'),
    city: z.string().trim().min(2),
    state: z.string().trim().min(2),
    pinCode: z.string().trim().regex(/^[0-9]{6}$/, 'Enter a valid 6-digit PIN'),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    googleMapsPlaceId: z.string().trim().max(255).nullable().optional(),
    openingHours: z.array(openingHourRow).length(7),
    website: z.string().trim().max(512).optional(),
    googleBusinessUrl: z.string().trim().max(512).optional(),
    instagram: z.string().trim().max(200).optional(),
    facebook: z.string().trim().max(512).optional(),
    insideViewKey: z.string().min(1, 'Inside view upload is required'),
    insideViewUrl: z.string().max(2048).optional(),
    outsideViewKey: z.string().min(1, 'Outside view upload is required'),
    outsideViewUrl: z.string().max(2048).optional(),
    adminName: z.string().trim().min(2, 'Admin name is required').max(255),
    adminEmail: z.string().trim().email(),
    adminPhone: z
      .string()
      .trim()
      .regex(/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .superRefine((v, ctx) => {
    if (v.password !== v.confirmPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Passwords do not match', path: ['confirmPassword'] });
    }
  });

export async function listMerchantBranchRequests(req: Request, res: Response): Promise<void> {
  const auth = req.auth?.merchant;
  if (!auth) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthenticated');
  if (auth.role !== 'MERCHANT_ADMIN') {
    throw new AppError(403, ErrorCodes.FORBIDDEN, 'Only merchant administrators can view branch requests');
  }

  const repo = getDataSource().getRepository(MerchantBranchRequest);
  const rows = await repo.find({
    where: { merchant: { id: auth.merchantId } },
    order: { createdAt: 'DESC' },
    take: 50,
  });

  res.json({
    ok: true,
    requests: rows.map((r) => ({
      id: r.id,
      branchName: r.branchName,
      status: r.status,
      adminEmail: r.adminEmail,
      adminName: r.adminName,
      createdAt: r.createdAt.toISOString(),
      reviewedAt: r.reviewedAt?.toISOString() ?? null,
      rejectionReason: r.rejectionReason,
      resolvedBranchId: r.resolvedBranchId,
    })),
  });
}

export async function submitMerchantBranchRequest(req: Request, res: Response): Promise<void> {
  const auth = req.auth?.merchant;
  if (!auth) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthenticated');
  if (auth.role !== 'MERCHANT_ADMIN') {
    throw new AppError(403, ErrorCodes.FORBIDDEN, 'Only merchant administrators can request new branches');
  }

  const parsed = submitBranchRequestBody.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());
  }

  const email = parsed.data.adminEmail.toLowerCase();
  const userRepo = getDataSource().getRepository(MerchantUser);
  const existing = await userRepo.findOne({ where: { merchant: { id: auth.merchantId }, email } });
  if (existing) {
    throw new AppError(409, ErrorCodes.CONFLICT, 'A user with this email already exists for your business');
  }

  const adminPasswordHash = await hashPassword({ password: parsed.data.password });
  const {
    branchName,
    adminName,
    adminPhone,
    password: _pw,
    confirmPassword: _cp,
    adminEmail: _ae,
    ...rest
  } = parsed.data;

  const payload = {
    ...rest,
  };

  const merchant = await getDataSource().getRepository(Merchant).findOne({ where: { id: auth.merchantId } });
  if (!merchant) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Merchant not found');

  const reqRepo = getDataSource().getRepository(MerchantBranchRequest);
  const row = reqRepo.create({
    merchant,
    branchName: branchName.trim(),
    status: 'PENDING',
    payload,
    adminEmail: email,
    adminName: adminName.trim(),
    adminPhone: adminPhone.trim(),
    adminPasswordHash,
    reviewedByStaff: null,
    reviewedAt: null,
    rejectionReason: null,
    resolvedBranchId: null,
  });
  await reqRepo.save(row);

  res.status(201).json({
    ok: true,
    request: {
      id: row.id,
      branchName: row.branchName,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    },
  });
}
