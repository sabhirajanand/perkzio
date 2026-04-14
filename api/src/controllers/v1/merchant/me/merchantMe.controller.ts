import type { Request, Response } from 'express';

import { getDataSource } from '../../../../config/database.js';
import { Merchant } from '../../../../entities/Merchant.js';
import { MerchantUser } from '../../../../entities/MerchantUser.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';

export async function merchantMe(req: Request, res: Response): Promise<void> {
  const merchantId = req.auth?.merchant?.merchantId ?? null;
  const merchantUserId = req.auth?.merchant?.merchantUserId ?? null;
  if (!merchantId) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthorized');
  if (!merchantUserId) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthorized');

  const merchant = await getDataSource().getRepository(Merchant).findOne({ where: { id: merchantId } });
  if (!merchant) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Merchant not found');

  const user = await getDataSource().getRepository(MerchantUser).findOne({ where: { id: merchantUserId } });
  if (!user) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Merchant user not found');

  res.json({
    ok: true,
    merchant: {
      id: merchant.id,
      status: merchant.status,
      kycStatus: merchant.kycStatus,
      subscriptionLimitedMode: merchant.subscriptionLimitedMode,
      primaryBusinessEmail: merchant.primaryBusinessEmail,
    },
    user: {
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt,
      role: user.role,
    },
  });
}

