import { S3Client } from '@aws-sdk/client-s3';
import { loadEnv } from '../../config/env.js';

export function getS3Client(): S3Client {
  const env = loadEnv();
  if (!env.AWS_REGION) throw new Error('AWS_REGION is not set');
  if (!env.AWS_ACCESS_KEY_ID) throw new Error('AWS_ACCESS_KEY_ID is not set');
  if (!env.AWS_SECRET_ACCESS_KEY) throw new Error('AWS_SECRET_ACCESS_KEY is not set');

  return new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

