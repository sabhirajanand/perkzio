import type { Express } from 'express';

import { merchantLogin, merchantLogout } from '../../../controllers/v1/merchant/auth/merchantAuth.controller.js';
import { presignKycUpload } from '../../../controllers/v1/merchant/kyc/merchantKycUpload.controller.js';
import { submitMerchantOnboardingApplication } from '../../../controllers/v1/merchant/onboarding/merchantOnboarding.controller.js';
import { sendOtp, verifyOtp } from '../../../controllers/v1/merchant/otp/merchantOtp.controller.js';
import { asyncHandler } from '../../../lib/http/asyncHandler.js';
import { confirmOnboardingPayment } from '../../../controllers/v1/merchant/payments/onboardingPayments.controller.js';

export function registerMerchantRoutes(app: Express): void {
  app.post('/v1/auth/merchant/login', asyncHandler(merchantLogin));
  app.post('/v1/auth/logout', merchantLogout);
  app.post('/v1/otp/send', asyncHandler(sendOtp));
  app.post('/v1/otp/verify', asyncHandler(verifyOtp));
  app.post('/v1/kyc/presign', asyncHandler(presignKycUpload));
  app.post('/v1/onboarding/application', asyncHandler(submitMerchantOnboardingApplication));
  app.post('/v1/onboarding/payment/confirm', asyncHandler(confirmOnboardingPayment));
}

