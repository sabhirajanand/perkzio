import type { Request, Response } from 'express';
import { z } from 'zod';

import { getDataSource } from '../../../../config/database.js';
import { CampaignSend } from '../../../../entities/CampaignSend.js';
import { OfferRedemption } from '../../../../entities/OfferRedemption.js';
import { RewardRedemption } from '../../../../entities/RewardRedemption.js';
import { StampEvent } from '../../../../entities/StampEvent.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';

const dashboardSummaryQuery = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  branchId: z.string().uuid().optional(),
});

function parseDateRange(q: { start?: string; end?: string }): { start: Date; end: Date } {
  const end = q.end ? new Date(q.end) : new Date();
  const start = q.start ? new Date(q.start) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { start, end };
}

export async function getDashboardSummary(req: Request, res: Response): Promise<void> {
  const parsed = dashboardSummaryQuery.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid query', parsed.error.flatten());
  }

  const auth = req.auth?.merchant;
  if (!auth) {
    throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthenticated');
  }

  const { start, end } = parseDateRange(parsed.data);
  const requestedBranchId =
    auth.role === 'BRANCH_ADMIN' ? auth.branchId : (parsed.data.branchId ?? null);
  if (auth.role === 'BRANCH_ADMIN' && !requestedBranchId) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Branch admin must have a branch');
  }

  const ds = getDataSource();

  const stampsIssuedPromise = ds
    .getRepository(StampEvent)
    .createQueryBuilder('se')
    .innerJoin('se.merchant', 'm')
    .where('m.id = :merchantId', { merchantId: auth.merchantId })
    .andWhere('se.occurredAt >= :start AND se.occurredAt <= :end', { start, end })
    .andWhere(requestedBranchId ? 'se.branch_id = :branchId' : '1=1', {
      branchId: requestedBranchId ?? undefined,
    })
    .getCount();

  const activeCustomersPromise = ds
    .getRepository(StampEvent)
    .createQueryBuilder('se')
    .select('COUNT(DISTINCT se.customer_id)', 'count')
    .innerJoin('se.merchant', 'm')
    .where('m.id = :merchantId', { merchantId: auth.merchantId })
    .andWhere('se.occurredAt >= :start AND se.occurredAt <= :end', { start, end })
    .andWhere(requestedBranchId ? 'se.branch_id = :branchId' : '1=1', {
      branchId: requestedBranchId ?? undefined,
    })
    .getRawOne<{ count: string }>()
    .then((r) => Number(r?.count ?? 0));

  const rewardRedemptionsPromise = ds
    .getRepository(RewardRedemption)
    .createQueryBuilder('rr')
    .innerJoin('rr.loyaltyCard', 'lc')
    .innerJoin('lc.merchant', 'm')
    .where('m.id = :merchantId', { merchantId: auth.merchantId })
    .andWhere('rr.redeemedAt IS NOT NULL')
    .andWhere('rr.redeemedAt >= :start AND rr.redeemedAt <= :end', { start, end })
    .andWhere(requestedBranchId ? 'rr.branch_id = :branchId' : '1=1', {
      branchId: requestedBranchId ?? undefined,
    })
    .getCount();

  const offerRedemptionsPromise = ds
    .getRepository(OfferRedemption)
    .createQueryBuilder('or')
    .innerJoin('or.branch', 'b')
    .innerJoin('b.merchant', 'm')
    .where('m.id = :merchantId', { merchantId: auth.merchantId })
    .andWhere('or.redeemedAt >= :start AND or.redeemedAt <= :end', { start, end })
    .andWhere(requestedBranchId ? 'or.branch_id = :branchId' : '1=1', {
      branchId: requestedBranchId ?? undefined,
    })
    .getCount();

  const campaignDeliveriesPromise = ds
    .getRepository(CampaignSend)
    .createQueryBuilder('cs')
    .innerJoin('cs.campaign', 'c')
    .innerJoin('c.merchant', 'm')
    .where('m.id = :merchantId', { merchantId: auth.merchantId })
    .andWhere('cs.sentAt IS NOT NULL')
    .andWhere('cs.sentAt >= :start AND cs.sentAt <= :end', { start, end })
    .getCount();

  const [stampsIssued, activeCustomers, rewardRedemptions, offerRedemptions, campaignDeliveries] =
    await Promise.all([
      stampsIssuedPromise,
      activeCustomersPromise,
      rewardRedemptionsPromise,
      offerRedemptionsPromise,
      campaignDeliveriesPromise,
    ]);

  res.status(200).json({
    range: { start: start.toISOString(), end: end.toISOString() },
    scope: { branchId: requestedBranchId },
    kpis: {
      stampsIssued,
      activeCustomers,
      newWalletAdds: null,
      rewardRedemptions,
      offerRedemptions,
      campaignDeliveries,
    },
    updatedAt: new Date().toISOString(),
  });
}

