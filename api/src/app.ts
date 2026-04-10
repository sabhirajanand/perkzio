import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import type Redis from 'ioredis';
import type { Env } from './config/env.js';
import type { Logger } from './config/logger.js';
import { handleRazorpayWebhook } from './controllers/v1/webhooks/razorpayWebhook.controller.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { asyncHandler } from './lib/http/asyncHandler.js';
import { registerHealthRoutes } from './routes/health.routes.js';
import { registerV1Routes } from './routes/v1/index.js';

export interface AppContext {
  env: Env;
  logger: Logger;
  redis: Redis;
}

export function createApp(ctx: AppContext): express.Express {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet());
  app.post(
    '/v1/webhooks/razorpay',
    express.raw({ type: 'application/json' }),
    asyncHandler(handleRazorpayWebhook),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(requestIdMiddleware);
  app.use(
    cors({
      origin: ctx.env.CORS_ORIGINS,
      credentials: true,
    }),
  );

  registerHealthRoutes(app, ctx.logger, ctx.redis);
  registerV1Routes(app);

  app.use(errorHandler(ctx.logger));

  return app;
}
