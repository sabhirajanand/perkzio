import { PutObjectCommand } from '@aws-sdk/client-s3';
import { makeSupabaseS3Client } from '@/lib/supabaseS3';

function getSupabasePublicBaseUrl() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.SUPABASE_BUCKET;
  if (!base || !bucket) throw new Error('Supabase public URL env is not configured');
  return { base: base.replace(/\/+$/, ''), bucket };
}

export async function uploadImageToSupabaseS3(input: {
  file: File;
  key: string;
}) {
  const client = makeSupabaseS3Client();
  const { base, bucket } = getSupabasePublicBaseUrl();

  const buffer = Buffer.from(await input.file.arrayBuffer());
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: input.key,
      Body: buffer,
      ContentType: input.file.type || 'application/octet-stream',
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  const url = `${base}/storage/v1/object/public/${bucket}/${input.key}`;
  return { url, key: input.key };
}

