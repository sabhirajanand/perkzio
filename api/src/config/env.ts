import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  DATABASE_URL: z.string().min(1).optional(),
  DB_CONNECTION: z.enum(['pgsql', 'postgres', 'postgresql']).optional(),
  DB_HOST: z.string().min(1).optional(),
  DB_PORT: z.coerce.number().int().positive().optional(),
  DB_DATABASE: z.string().min(1).optional(),
  DB_USERNAME: z.string().min(1).optional(),
  DB_PASSWORD: z.string().min(1).optional(),

  REDIS_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32).optional(),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().default(900),
  JWT_REFRESH_TTL_SECONDS: z.coerce.number().default(604800),

  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3001')
    .transform((s) =>
      s
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
    ),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function loadEnv(): Env {
  if (cached) {
    return cached;
  }
  const input = process.env as Record<string, string | undefined>;
  const databaseUrlFromEnv = input.DATABASE_URL?.trim();
  const databaseUrlFromParts =
    (databaseUrlFromEnv && databaseUrlFromEnv.length > 0 ? databaseUrlFromEnv : undefined) ??
    (input.DB_HOST && input.DB_DATABASE && input.DB_USERNAME && input.DB_PASSWORD
      ? `postgresql://${encodeURIComponent(input.DB_USERNAME)}:${encodeURIComponent(
          input.DB_PASSWORD,
        )}@${input.DB_HOST}:${input.DB_PORT ?? '5432'}/${input.DB_DATABASE}`
      : undefined);

  if (databaseUrlFromParts) {
    process.env.DATABASE_URL = databaseUrlFromParts;
  }

  cached = envSchema
    .extend({ DATABASE_URL: z.string().min(1) })
    .parse({ ...process.env, DATABASE_URL: databaseUrlFromParts });
  return cached;
}
