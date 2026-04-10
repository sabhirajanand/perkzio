import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();

import { createApp } from './app.js';
import { closeDatabase, initDatabase } from './config/database.js';
import { loadEnv } from './config/env.js';
import { createLogger } from './config/logger.js';
import { createRedisClient, closeRedis } from './config/redis.js';
import { registerShutdownHandlers } from './shutdown.js';

async function main(): Promise<void> {
  const env = loadEnv();
  const logger = createLogger(env);
  const redis = createRedisClient(env);

  await initDatabase();

  const app = createApp({ env, logger, redis });
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'server_listening');
  });

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
