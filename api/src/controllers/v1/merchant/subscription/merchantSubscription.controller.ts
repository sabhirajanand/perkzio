import type { Request, Response } from 'express';
import { z } from 'zod';

import { getDataSource } from '../../../../config/database.js';
import { Merchant } from '../../../../entities/Merchant.js';
import { MerchantSubscription } from '../../../../entities/MerchantSubscription.js';
import { SubscriptionPlan } from '../../../../entities/SubscriptionPlan.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';

const updatePlanSchema = z.object({
  planCode: z.enum(['LITE', 'GROWTH', 'PRO']),
});

export async function updateMySubscriptionPlan(req: Request, res: Response): Promise<void> {
  const auth = req.auth?.merchant;
  if (!auth) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthenticated');
  if (auth.role !== 'MERCHANT_ADMIN') throw new AppError(403, ErrorCodes.FORBIDDEN, 'Only merchant admins can change the plan');

  const parsed = updatePlanSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());

  const ds = getDataSource();
  await ds.transaction(async (tx) => {
    const merchantRepo = tx.getRepository(Merchant);
    const planRepo = tx.getRepository(SubscriptionPlan);
    const subRepo = tx.getRepository(MerchantSubscription);

    const merchant = await merchantRepo.findOne({ where: { id: auth.merchantId } });
    if (!merchant) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Merchant not found');

    const plan = await planRepo.findOne({ where: { code: parsed.data.planCode } });
    if (!plan) throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Plan not found');

    const existing = await subRepo.findOne({ where: { merchant: { id: auth.merchantId } }, relations: { merchant: true, plan: true } });
    if (existing) {
      existing.plan = plan;
      await subRepo.save(existing);
    } else {
      const created = subRepo.create({
        merchant,
        plan,
        billingPeriod: 'MONTHLY',
        status: 'ACTIVE',
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: null,
        razorpaySubscriptionId: null,
        limitedModeSince: null,
      });
      await subRepo.save(created);
    }

    res.json({ ok: true, plan: { code: plan.code, name: plan.name } });
  });
}

