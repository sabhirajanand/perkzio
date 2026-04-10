import { SubscriptionPlan } from '../entities/SubscriptionPlan.js';
import { getDataSource } from '../config/database.js';

const DEFAULT_PLANS: Array<Pick<
  SubscriptionPlan,
  | 'code'
  | 'name'
  | 'maxLoyaltyCards'
  | 'maxActiveCustomers'
  | 'maxMonthlyPushNotifications'
  | 'maxConcurrentSpecialOffers'
  | 'allowedCampaignTypes'
  | 'analyticsTier'
  | 'supportSlaTier'
  | 'qrStandeeEntitlement'
  | 'isActive'
>> = [
  {
    code: 'LITE',
    name: 'Lite',
    maxLoyaltyCards: 3,
    maxActiveCustomers: 100,
    maxMonthlyPushNotifications: 0,
    maxConcurrentSpecialOffers: 0,
    allowedCampaignTypes: [],
    analyticsTier: 'BASIC',
    supportSlaTier: '48_HRS',
    qrStandeeEntitlement: null,
    isActive: true,
  },
  {
    code: 'GROWTH',
    name: 'Growth',
    maxLoyaltyCards: null,
    maxActiveCustomers: null,
    maxMonthlyPushNotifications: null,
    maxConcurrentSpecialOffers: null,
    allowedCampaignTypes: ['EMAIL', 'SMS', 'PUSH'],
    analyticsTier: 'ADVANCED',
    supportSlaTier: '24_HRS',
    qrStandeeEntitlement: null,
    isActive: true,
  },
  {
    code: 'PRO',
    name: 'Pro',
    maxLoyaltyCards: null,
    maxActiveCustomers: null,
    maxMonthlyPushNotifications: null,
    maxConcurrentSpecialOffers: null,
    allowedCampaignTypes: ['EMAIL', 'SMS', 'PUSH'],
    analyticsTier: 'CUSTOM',
    supportSlaTier: '4_HRS',
    qrStandeeEntitlement: null,
    isActive: true,
  },
];

export async function seedSubscriptionPlans(): Promise<void> {
  const repo = getDataSource().getRepository(SubscriptionPlan);
  for (const plan of DEFAULT_PLANS) {
    const existing = await repo.findOne({ where: { code: plan.code } });
    if (existing) {
      existing.name = plan.name;
      existing.maxLoyaltyCards = plan.maxLoyaltyCards;
      existing.maxActiveCustomers = plan.maxActiveCustomers;
      existing.maxMonthlyPushNotifications = plan.maxMonthlyPushNotifications;
      existing.maxConcurrentSpecialOffers = plan.maxConcurrentSpecialOffers;
      existing.allowedCampaignTypes = plan.allowedCampaignTypes;
      existing.analyticsTier = plan.analyticsTier;
      existing.supportSlaTier = plan.supportSlaTier;
      existing.qrStandeeEntitlement = plan.qrStandeeEntitlement;
      existing.isActive = plan.isActive;
      await repo.save(existing);
    } else {
      await repo.save(
        repo.create({
          ...plan,
          allowedCampaignTypes: plan.allowedCampaignTypes,
          qrStandeeEntitlement: plan.qrStandeeEntitlement,
        }),
      );
    }
  }
}

