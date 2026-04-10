import { z } from 'zod';

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export const registerApplicationSchema = z.object({
  businessName: z.string().min(2),
  category: z.string().min(1, 'Select a category'),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z
    .string()
    .min(10)
    .max(15)
    .regex(/^[0-9+ -]+$/, 'Invalid phone number'),
  otpChallengeId: z.string().uuid(),
  pan: z
    .string()
    .trim()
    .transform((s) => s.toUpperCase())
    .pipe(z.string().regex(panRegex, 'Invalid PAN')),
  outletsCount: z.preprocess(
    (v) => (typeof v === 'string' || typeof v === 'number' ? Number(v) : v),
    z.number().int().min(1).max(200),
  ),
  gstin: z
    .string()
    .trim()
    .refine((v) => !v || /^[0-9A-Z]{15}$/.test(v), 'GSTIN must be 15 characters (A-Z, 0-9)'),
  addressLine1: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2, 'Select state'),
  pinCode: z.string().regex(/^[0-9]{6}$/, 'Enter a valid 6-digit PIN'),
  mapsUrl: z
    .string()
    .min(1, 'Google Maps link is required')
    .refine((v) => /^https?:\/\/.+/i.test(v), 'Enter a valid URL'),
  website: z.string().trim().max(512),
  googleBusinessUrl: z.string().trim().max(512),
  instagram: z.string().trim().max(200),
  facebook: z.string().trim().max(512),
  gstCertFileName: z.string().optional(),
  panCardFileName: z.string().optional(),
  addressProofFileName: z.string().optional(),
  shopPhotoFileName: z.string().optional(),
  gstCertUploadKey: z.string().optional(),
  panCardUploadKey: z.string().optional(),
  addressProofUploadKey: z.string().optional(),
  shopPhotoUploadKey: z.string().optional(),
  plan: z.enum(['LITE', 'GROWTH', 'PRO']),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']).optional(),
});

export type RegisterApplicationInput = z.infer<typeof registerApplicationSchema>;
