import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import { loadEnv } from '../../../../config/env.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';
import { getS3Client } from '../../../../lib/storage/s3.js';

const presignSchema = z.object({
  otpChallengeId: z.string().uuid(),
  documentType: z.enum(['GST_CERT', 'PAN_CARD', 'ADDRESS_PROOF', 'SHOP_PHOTO']),
  fileName: z.string().min(1).max(255),
  contentType: z.string().min(1).max(128),
  sizeBytes: z.number().int().positive().max(10 * 1024 * 1024),
});

function safeFileName(input: string): string {
  return input.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120);
}

export async function presignKycUpload(req: Request, res: Response): Promise<void> {
  const parsed = presignSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());
  }

  const env = loadEnv();
  if (!env.KYC_DOCS_BUCKET) {
    throw new AppError(500, ErrorCodes.INTERNAL_ERROR, 'KYC_DOCS_BUCKET is not set');
  }

  const key = [
    'onboarding',
    parsed.data.otpChallengeId,
    parsed.data.documentType,
    `${randomUUID()}-${safeFileName(parsed.data.fileName)}`,
  ].join('/');

  const command = new PutObjectCommand({
    Bucket: env.KYC_DOCS_BUCKET,
    Key: key,
    ContentType: parsed.data.contentType,
  });

  const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 60 * 10 });

  res.json({
    ok: true,
    s3Bucket: env.KYC_DOCS_BUCKET,
    s3Key: key,
    uploadUrl,
  });
}

