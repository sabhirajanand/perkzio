import { seedPlatformPermissions } from './platformPermissions.seeder.js';
import { seedSubscriptionPlans } from './subscriptionPlans.seeder.js';
import { seedDefaultSuperadmin } from './superadmin.seeder.js';

export async function runSeeders(): Promise<void> {
  await seedSubscriptionPlans();
  await seedPlatformPermissions();
  await seedDefaultSuperadmin();
}

