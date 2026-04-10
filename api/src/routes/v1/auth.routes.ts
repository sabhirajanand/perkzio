import type { Express } from 'express';

import { registerMerchantRoutes } from './merchant/merchant.routes.js';

export function registerAuthRoutes(app: Express): void {
  registerMerchantRoutes(app);
}

