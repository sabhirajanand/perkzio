import type { Express } from 'express';

import { merchantLogin, merchantLogout } from '../../../controllers/v1/merchant/auth/merchantAuth.controller.js';
import { getDashboardSummary } from '../../../controllers/v1/merchant/dashboard/merchantDashboard.controller.js';
import {
  listMerchantBranchRequests,
  submitMerchantBranchRequest,
} from '../../../controllers/v1/merchant/branchRequests/merchantBranchRequests.controller.js';
import { listBranches } from '../../../controllers/v1/merchant/branches/merchantBranches.controller.js';
import { getCustomer, listCustomers } from '../../../controllers/v1/merchant/customers/merchantCustomers.controller.js';
import { createOffer, getOffer, listOffers, updateOffer } from '../../../controllers/v1/merchant/offers/merchantOffers.controller.js';
import { sendMerchantEmailVerification, verifyMerchantEmailVerification } from '../../../controllers/v1/merchant/emailVerification/merchantEmailVerification.controller.js';
import { presignKycUpload } from '../../../controllers/v1/merchant/kyc/merchantKycUpload.controller.js';
import { merchantMe } from '../../../controllers/v1/merchant/me/merchantMe.controller.js';
import { submitMerchantOnboardingApplication } from '../../../controllers/v1/merchant/onboarding/merchantOnboarding.controller.js';
import { checkBusinessEmailUnique } from '../../../controllers/v1/merchant/onboarding/merchantOnboardingEmail.controller.js';
import { sendOtp, verifyOtp } from '../../../controllers/v1/merchant/otp/merchantOtp.controller.js';
import { merchantAuthMiddleware } from '../../../middleware/merchantAuth.js';
import { asyncHandler } from '../../../lib/http/asyncHandler.js';
import { confirmOnboardingPayment } from '../../../controllers/v1/merchant/payments/onboardingPayments.controller.js';

export function registerMerchantRoutes(app: Express): void {
  app.post('/v1/auth/merchant/login', asyncHandler(merchantLogin));
  app.post('/v1/auth/logout', merchantLogout);
  app.post('/v1/otp/send', asyncHandler(sendOtp));
  app.post('/v1/otp/verify', asyncHandler(verifyOtp));
  app.post('/v1/kyc/presign', asyncHandler(presignKycUpload));
  app.post('/v1/onboarding/check-email', asyncHandler(checkBusinessEmailUnique));
  app.post('/v1/onboarding/application', asyncHandler(submitMerchantOnboardingApplication));
  app.post('/v1/onboarding/payment/confirm', asyncHandler(confirmOnboardingPayment));

  app.get('/v1/merchant/me', merchantAuthMiddleware, asyncHandler(merchantMe));
  app.post('/v1/merchant/email/verification/send', merchantAuthMiddleware, asyncHandler(sendMerchantEmailVerification));
  app.post('/v1/merchant/email/verification/verify', merchantAuthMiddleware, asyncHandler(verifyMerchantEmailVerification));
  app.get('/v1/merchant/dashboard/summary', merchantAuthMiddleware, asyncHandler(getDashboardSummary));
  app.get('/v1/merchant/customers', merchantAuthMiddleware, asyncHandler(listCustomers));
  app.get('/v1/merchant/customers/:customerId', merchantAuthMiddleware, asyncHandler(getCustomer));
  app.get('/v1/merchant/branches', merchantAuthMiddleware, asyncHandler(listBranches));
  app.get('/v1/merchant/branch-requests', merchantAuthMiddleware, asyncHandler(listMerchantBranchRequests));
  app.post('/v1/merchant/branch-requests', merchantAuthMiddleware, asyncHandler(submitMerchantBranchRequest));
  app.get('/v1/merchant/offers', merchantAuthMiddleware, asyncHandler(listOffers));
  app.post('/v1/merchant/offers', merchantAuthMiddleware, asyncHandler(createOffer));
  app.get('/v1/merchant/offers/:offerId', merchantAuthMiddleware, asyncHandler(getOffer));
  app.patch('/v1/merchant/offers/:offerId', merchantAuthMiddleware, asyncHandler(updateOffer));
}

