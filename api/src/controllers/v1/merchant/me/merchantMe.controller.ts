import type { Request, Response } from 'express';

import { getDataSource } from '../../../../config/database.js';
import { Merchant } from '../../../../entities/Merchant.js';
import { MerchantOnboardingApplication } from '../../../../entities/MerchantOnboardingApplication.js';
import { MerchantSubscription } from '../../../../entities/MerchantSubscription.js';
import { MerchantUser } from '../../../../entities/MerchantUser.js';
import { SubscriptionPlan } from '../../../../entities/SubscriptionPlan.js';
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

  const subscription = await getDataSource()
    .getRepository(MerchantSubscription)
    .createQueryBuilder('ms')
    .innerJoin(SubscriptionPlan, 'p', 'p.id = ms.plan_id')
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
      'oa_latest.merchant_id = ms.merchant_id',
    )
    .leftJoin(SubscriptionPlan, 'op', 'op.id = oa_latest.selected_plan_id')
    .select('COALESCE(p.code, op.code)', 'code')
    .addSelect('COALESCE(p.name, op.name)', 'name')
    .where('ms.merchant_id = :merchantId', { merchantId })
    .getRawOne<{ code: string | null; name: string | null }>();

  const onboardingPlan = subscription?.code
    ? null
    : await getDataSource()
        .getRepository(MerchantOnboardingApplication)
        .createQueryBuilder('oa')
        .innerJoin(SubscriptionPlan, 'op', 'op.id = oa.selected_plan_id')
        .select('op.code', 'code')
        .addSelect('op.name', 'name')
        .where('oa.merchant_id = :merchantId', { merchantId })
        .orderBy('oa.created_at', 'DESC')
        .getRawOne<{ code: string; name: string }>();

  res.json({
    ok: true,
    merchant: {
      id: merchant.id,
      status: merchant.status,
      kycStatus: merchant.kycStatus,
      subscriptionLimitedMode: merchant.subscriptionLimitedMode,
      primaryBusinessEmail: merchant.primaryBusinessEmail,
      plan:
        subscription && subscription.code
          ? { code: subscription.code, name: subscription.name ?? subscription.code }
          : onboardingPlan && onboardingPlan.code
            ? { code: onboardingPlan.code, name: onboardingPlan.name ?? onboardingPlan.code }
            : null,
    },
    user: {
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt,
      role: user.role,
    },
  });
}

