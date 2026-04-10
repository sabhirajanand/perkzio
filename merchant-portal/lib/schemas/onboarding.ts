import { z } from 'zod';

export const onboardingApplicationSchema = z.object({
  businessName: z.string().min(2),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z
    .string()
    .min(10)
    .max(15)
    .regex(/^[0-9+ -]+$/, 'Invalid phone number'),
  outletsCount: z.preprocess(
    (v) => (typeof v === 'string' || typeof v === 'number' ? Number(v) : v),
    z.number().int().min(1).max(200),
  ),
  gstin: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^[0-9A-Z]{15}$/.test(v), 'GSTIN must be 15 characters (A-Z, 0-9)'),
  city: z.string().min(2),
  addressLine1: z.string().min(5),
  plan: z.enum(['LITE', 'GROWTH', 'PRO']),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']).optional(),
});

export type OnboardingApplicationInput = z.infer<typeof onboardingApplicationSchema>;
