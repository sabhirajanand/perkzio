import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();

import { createApp } from './app.js';
import { closeDatabase, initDatabase } from './config/database.js';
import { loadEnv } from './config/env.js';
import { createLogger } from './config/logger.js';
import { createRedisClient, closeRedis } from './config/redis.js';
import { runSeeders } from './seeders/index.js';
import { registerShutdownHandlers } from './shutdown.js';
import { runBillingCron } from './cron/billingCron.js';

async function main(): Promise<void> {
  const env = loadEnv();
  const logger = createLogger(env);
  const redis = createRedisClient(env);

  await initDatabase();
  try {
    await runSeeders();
  } catch (err) {
    logger.warn({ err }, 'seeders_failed');
  }

  const app = createApp({ env, logger, redis });
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'server_listening');
  });

  if (env.ENABLE_CRON) {
    const run = async () => {
      try {
        await runBillingCron();
      } catch (err) {
        logger.error({ err }, 'billing_cron_failed');
      }
    };
    void run();
    setInterval(() => void run(), 60 * 60 * 1000);
  }

  registerShutdownHandlers({
    server,
    logger,
    closeDatabase,
    closeRedis,
  });
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
