import Redis from 'ioredis';
import type { Env } from './env.js';

let client: Redis | null = null;

export function getRedisKeyPrefix(env: Env): string {
  const envName = env.NODE_ENV === 'production' ? 'prod' : env.NODE_ENV === 'test' ? 'test' : 'dev';
  return `perkzio:${envName}:`;
}

export function createRedisClient(env: Env): Redis {
  if (client) {
    return client;
  }
  client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
  });
  return client;
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}

export function getRedis(): Redis | null {
  return client;
}
