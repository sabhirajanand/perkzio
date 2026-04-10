import type { Express } from 'express';
import type Redis from 'ioredis';
import { getDataSource } from '../config/database.js';
import type { Logger } from '../config/logger.js';

export function registerHealthRoutes(app: Express, logger: Logger, redis: Redis): void {
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/ready', async (req, res) => {
    const requestId = req.requestId;
    try {
      await getDataSource().query('SELECT 1');
      const pong = await redis.ping();
      if (pong !== 'PONG') {
        throw new Error('redis_ping_failed');
      }
      res.status(200).json({ status: 'ready', database: 'ok', redis: 'ok' });
    } catch (err) {
      logger.warn({ err, requestId }, 'readiness_failed');
      res.status(503).json({ status: 'not_ready' });
    }
  });
}
