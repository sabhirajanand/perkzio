import type { Request, Response } from 'express';

import { getDataSource } from '../../../../config/database.js';
import { Merchant } from '../../../../entities/Merchant.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';

export async function merchantMe(req: Request, res: Response): Promise<void> {
  const merchantId = req.auth?.merchant?.merchantId ?? null;
  if (!merchantId) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthorized');

  const merchant = await getDataSource().getRepository(Merchant).findOne({ where: { id: merchantId } });
  if (!merchant) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Merchant not found');

  res.json({
    ok: true,
    merchant: {
      id: merchant.id,
      status: merchant.status,
      kycStatus: merchant.kycStatus,
      subscriptionLimitedMode: merchant.subscriptionLimitedMode,
      primaryBusinessEmail: merchant.primaryBusinessEmail,
    },
  });
}

