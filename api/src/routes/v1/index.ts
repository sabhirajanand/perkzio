import type { Express } from 'express';
import { registerMerchantRoutes } from './merchant/merchant.routes.js';
import { registerPlatformRoutes } from './platform/platform.routes.js';

export function registerV1Routes(app: Express): void {
  app.get('/v1', (_req, res) => {
    res.json({ name: 'perkzio-api', version: '0.1.0' });
  });

  registerMerchantRoutes(app);
  registerPlatformRoutes(app);
}
