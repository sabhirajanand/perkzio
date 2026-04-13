import type { Request, Response } from 'express';
import { z } from 'zod';

import { getDataSource } from '../../../../config/database.js';
import { Merchant } from '../../../../entities/Merchant.js';
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

export async function getMerchant(req: Request, res: Response): Promise<void> {
  const merchantId = z.string().uuid().parse(req.params.merchantId);
  const ds = getDataSource();
  const repo = ds.getRepository(Merchant);
  const merchant = await repo.findOne({ where: { id: merchantId } });
  if (!merchant) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Merchant not found');

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
      createdAt: merchant.createdAt,
      updatedAt: merchant.updatedAt,
    },
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

