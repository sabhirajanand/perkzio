import { z } from 'zod';

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export const registerApplicationSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  category: z.string().min(1, 'Select a category'),
  contactName: z.string().min(2, 'Merchant name must be at least 2 characters'),
  contactEmail: z.string().email('Enter a valid email address'),
  contactPhone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, 'Please enter a valid mobile number.'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  pan: z
    .string()
    .trim()
    .transform((s) => s.toUpperCase())
    .refine((v) => !v || panRegex.test(v), 'Enter a valid PAN (e.g. ABCDE1234F)'),
  outletsCount: z.preprocess(
    (v) => (typeof v === 'string' || typeof v === 'number' ? Number(v) : v),
    z.number().int().min(1, 'Outlets must be at least 1').max(200, 'Outlets cannot exceed 200'),
  ),
  gstin: z
    .string()
    .trim()
    .refine((v) => !v || /^[0-9A-Z]{15}$/.test(v), 'Enter a valid GSTIN (15 characters, A-Z and 0-9)'),
  addressLine1: z.string().min(5, 'Registered address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
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
  insideViewFileName: z.string().min(1, 'Inside view is required'),
  insideViewUrl: z.string().optional(),
  outsideViewFileName: z.string().min(1, 'Outside view is required'),
  outsideViewUrl: z.string().optional(),
  logoFileName: z.string().min(1, 'Logo is required'),
  logoUrl: z.string().optional(),
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
}).superRefine((v, ctx) => {
  if (v.password !== v.confirmPassword) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Passwords do not match', path: ['confirmPassword'] });
  }
});

export type RegisterApplicationInput = z.infer<typeof registerApplicationSchema>;
