import { z } from 'zod';

import { getDataSource } from '../../config/database.js';
import { Branch } from '../../entities/Branch.js';
import { Merchant } from '../../entities/Merchant.js';
import { MerchantOnboardingApplication } from '../../entities/MerchantOnboardingApplication.js';
import { MerchantUser } from '../../entities/MerchantUser.js';
import { AppError } from '../../errors/AppError.js';
import { ErrorCodes } from '../../errors/codes.js';

const businessPayloadSchema = z.object({
  businessName: z.string().min(2),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(10).max(15),
  passwordHash: z.string().min(20),
  pan: z.string().min(1),
  gstin: z.string().optional(),
  addressLine1: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pinCode: z.string().min(1),
  mapsUrl: z.string().min(1),
  outletsCount: z.number().int().min(1).max(200),
  plan: z.enum(['LITE', 'GROWTH', 'PRO']),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']).optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  googleBusinessUrl: z.string().optional(),
});



export async function provisionMerchantFromApplication(input: {
  application: MerchantOnboardingApplication;
}): Promise<{ merchant: Merchant; headBranch: Branch; merchantAdminUser: MerchantUser }> {
  const parsed = businessPayloadSchema.safeParse(input.application.businessPayload);
  if (!parsed.success) {
    throw new AppError(409, ErrorCodes.CONFLICT, 'Application payload is invalid or incomplete');
  }

  const ds = getDataSource();
  const merchantRepo = ds.getRepository(Merchant);
  const branchRepo = ds.getRepository(Branch);
  const userRepo = ds.getRepository(MerchantUser);

  const existingUser = await userRepo.findOne({ where: { email: parsed.data.contactEmail.toLowerCase() } });
  if (existingUser) {
    throw new AppError(409, ErrorCodes.CONFLICT, 'A merchant user already exists for this email');
  }

  const merchant = await merchantRepo.save(
    merchantRepo.create({
      legalName: parsed.data.businessName,
      tradingName: null,
      category: null,
      status: 'ACTIVE',
      kycStatus: 'PENDING',
      subscriptionLimitedMode: false,
      primaryBusinessEmail: parsed.data.contactEmail.toLowerCase(),
      pan: parsed.data.pan,
      gstin: parsed.data.gstin ?? null,
      registeredAddress: {
        line1: parsed.data.addressLine1,
        city: parsed.data.city,
        state: parsed.data.state,
        pinCode: parsed.data.pinCode,
        mapsUrl: parsed.data.mapsUrl,
      },
      referralCode: null,
    }),
  );

  const headBranch = await branchRepo.save(
    branchRepo.create({
      merchant,
      name: 'Head Branch',
      isHeadBranch: true,
      status: 'ACTIVE',
      address: merchant.registeredAddress,
      googleMapsPlaceId: null,
      latitude: null,
      longitude: null,
      openingHours: null,
      socialLinks: {
        website: parsed.data.website,
        instagram: parsed.data.instagram,
        facebook: parsed.data.facebook,
        googleBusinessUrl: parsed.data.googleBusinessUrl,
      },
    }),
  );

  const merchantAdminUser = await userRepo.save(
    userRepo.create({
      merchant,
      branch: headBranch,
      email: parsed.data.contactEmail.toLowerCase(),
      passwordHash: parsed.data.passwordHash,
      role: 'MERCHANT_ADMIN',
      status: 'ACTIVE',
      lastLoginAt: null,
    }),
  );

  return { merchant, headBranch, merchantAdminUser };
}

