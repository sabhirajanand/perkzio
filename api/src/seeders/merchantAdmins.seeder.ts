import { getDataSource } from '../config/database.js';
import { Branch } from '../entities/Branch.js';
import { Merchant } from '../entities/Merchant.js';
import { MerchantUser } from '../entities/MerchantUser.js';
import { hashPassword } from '../lib/auth/password.js';

function readOptionalCredential(key: string): string | null {
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : null;
}

export async function seedDefaultMerchantAdmins(): Promise<void> {
  const env = process.env.NODE_ENV ?? 'development';

  const merchantAdminEmail =
    readOptionalCredential('SEED_MERCHANT_ADMIN_EMAIL') ?? (env === 'development' ? 'merchant.admin@perkzio.local' : null);
  const merchantAdminPassword =
    readOptionalCredential('SEED_MERCHANT_ADMIN_PASSWORD') ?? (env === 'development' ? 'Password@123' : null);
  const branchAdminEmail =
    readOptionalCredential('SEED_BRANCH_ADMIN_EMAIL') ?? (env === 'development' ? 'branch.admin@perkzio.local' : null);
  const branchAdminPassword =
    readOptionalCredential('SEED_BRANCH_ADMIN_PASSWORD') ?? (env === 'development' ? 'Password@123' : null);

  if (!merchantAdminEmail || !merchantAdminPassword || !branchAdminEmail || !branchAdminPassword) return;

  const ds = getDataSource();
  await ds.transaction(async (tx) => {
    const merchantRepo = tx.getRepository(Merchant);
    const branchRepo = tx.getRepository(Branch);
    const userRepo = tx.getRepository(MerchantUser);

    const merchant =
      (await merchantRepo.findOne({ where: { primaryBusinessEmail: merchantAdminEmail.toLowerCase() } })) ??
      (await merchantRepo.save(
        merchantRepo.create({
          legalName: 'Seeded Merchant',
          tradingName: 'Seeded Merchant',
          status: 'ACTIVE',
          kycStatus: 'APPROVED',
          subscriptionLimitedMode: false,
          primaryBusinessEmail: merchantAdminEmail.toLowerCase(),
          pan: null,
          gstin: null,
          registeredAddress: null,
          referralCode: null,
          category: null,
          deletedAt: null,
        }),
      ));

    const headBranch =
      (await branchRepo.findOne({ where: { merchant: { id: merchant.id }, isHeadBranch: true }, relations: { merchant: true } })) ??
      (await branchRepo.save(
        branchRepo.create({
          merchant,
          name: 'Head Branch',
          isHeadBranch: true,
          status: 'ACTIVE',
          address: null,
          googleMapsPlaceId: null,
          latitude: null,
          longitude: null,
          openingHours: null,
          socialLinks: null,
        }),
      ));

    const existingMerchantAdmin = await userRepo.findOne({
      where: { merchant: { id: merchant.id }, email: merchantAdminEmail.toLowerCase(), role: 'MERCHANT_ADMIN' },
      relations: { merchant: true, branch: true },
    });
    if (!existingMerchantAdmin) {
      await userRepo.save(
        userRepo.create({
          merchant,
          branch: null,
          email: merchantAdminEmail.toLowerCase(),
          passwordHash: await hashPassword({ password: merchantAdminPassword }),
          role: 'MERCHANT_ADMIN',
          status: 'ACTIVE',
          lastLoginAt: null,
        }),
      );
    } else if (!existingMerchantAdmin.passwordHash) {
      existingMerchantAdmin.passwordHash = await hashPassword({ password: merchantAdminPassword });
      existingMerchantAdmin.status = existingMerchantAdmin.status || 'ACTIVE';
      await userRepo.save(existingMerchantAdmin);
    }

    const existingBranchAdmin = await userRepo.findOne({
      where: { merchant: { id: merchant.id }, email: branchAdminEmail.toLowerCase(), role: 'BRANCH_ADMIN' },
      relations: { merchant: true, branch: true },
    });
    if (!existingBranchAdmin) {
      await userRepo.save(
        userRepo.create({
          merchant,
          branch: headBranch,
          email: branchAdminEmail.toLowerCase(),
          passwordHash: await hashPassword({ password: branchAdminPassword }),
          role: 'BRANCH_ADMIN',
          status: 'ACTIVE',
          lastLoginAt: null,
        }),
      );
    } else if (!existingBranchAdmin.passwordHash) {
      existingBranchAdmin.passwordHash = await hashPassword({ password: branchAdminPassword });
      existingBranchAdmin.status = existingBranchAdmin.status || 'ACTIVE';
      if (!existingBranchAdmin.branch) existingBranchAdmin.branch = headBranch;
      await userRepo.save(existingBranchAdmin);
    }
  });
}

