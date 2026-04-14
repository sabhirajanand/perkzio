import { S3Client } from '@aws-sdk/client-s3';

export function makeSupabaseS3Client() {
  const projectId = process.env.SUPABASE_PROJECT_ID;
  const region = process.env.SUPABASE_REGION;
  const accessKeyId = process.env.SUPABASE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.SUPABASE_SECRET_ACCESS_KEY;
  const endpoint = process.env.SUPABASE_S3_ENDPOINT;

  if (!projectId || !region || !accessKeyId || !secretAccessKey) {
    throw new Error('Supabase storage env is not configured');
  }

  return new S3Client({
    region,
    endpoint: endpoint?.trim() || `https://${projectId}.storage.supabase.co/storage/v1/s3`,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

