import type { Request, Response } from 'express';
import { z } from 'zod';

import { getDataSource } from '../../../../config/database.js';
import { Merchant } from '../../../../entities/Merchant.js';
import { MerchantOnboardingApplication } from '../../../../entities/MerchantOnboardingApplication.js';
import { MerchantUser } from '../../../../entities/MerchantUser.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';

const schema = z.object({
  email: z.string().email(),
});

export async function checkBusinessEmailUnique(req: Request, res: Response): Promise<void> {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());
  const email = parsed.data.email.trim().toLowerCase();

  const ds = getDataSource();
  const userRepo = ds.getRepository(MerchantUser);
  const merchantRepo = ds.getRepository(Merchant);
  const appRepo = ds.getRepository(MerchantOnboardingApplication);

  const [existingUser, existingMerchant] = await Promise.all([
    userRepo.findOne({ where: { email } }),
    merchantRepo.findOne({ where: { primaryBusinessEmail: email } }),
  ]);
  if (existingUser || existingMerchant) {
    res.json({ ok: true, unique: false });
    return;
  }

  const apps = await appRepo
    .createQueryBuilder('a')
    .select(['a.id AS id'])
    .where("a.business_payload->>'contactEmail' = :email", { email })
    .andWhere('a.status IN (:...statuses)', { statuses: ['PAYMENT_PENDING', 'SUBMITTED', 'APPROVED'] })
    .take(1)
    .getRawMany<{ id: string }>();
  if (apps.length > 0) {
    res.json({ ok: true, unique: false });
    return;
  }

  res.json({ ok: true, unique: true });
}

