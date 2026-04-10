import { getDataSource } from '../config/database.js';
import { MerchantSubscription } from '../entities/MerchantSubscription.js';
import { IsNull } from 'typeorm';

export async function runBillingCron(): Promise<void> {
  const repo = getDataSource().getRepository(MerchantSubscription);
  const now = new Date();

  const subs = await repo.find({
    where: { limitedModeSince: IsNull() },
    order: { createdAt: 'DESC' },
    take: 200,
  });

  for (const s of subs) {
    if (s.status === 'ACTIVE') continue;
    if (s.currentPeriodEnd && s.currentPeriodEnd.getTime() < now.getTime()) {
      s.limitedModeSince = now;
      await repo.save(s);
    }
  }
}

