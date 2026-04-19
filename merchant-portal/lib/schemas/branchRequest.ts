import { z } from 'zod';

const dayKey = z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

export const openingHourRowSchema = z.object({
  day: dayKey,
  open: z.boolean(),
  from: z.string(),
  to: z.string(),
});

export const branchRequestFormSchema = z
  .object({
    branchName: z.string().trim().min(2).max(255),
    mapsUrl: z
      .string()
      .min(1, 'Google Maps link is required')
      .refine((v) => /^https?:\/\/.+/i.test(v), 'Enter a valid URL'),
    addressLine1: z.string().trim().min(5, 'Address must be at least 5 characters'),
    city: z.string().trim().min(2),
    state: z.string().trim().min(2),
    pinCode: z.string().trim().regex(/^[0-9]{6}$/, 'Enter a valid 6-digit PIN'),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    googleMapsPlaceId: z.string().trim().max(255).nullable().optional(),
    openingHours: z.array(openingHourRowSchema).length(7),
    website: z.string().trim().max(512).optional(),
    googleBusinessUrl: z.string().trim().max(512).optional(),
    instagram: z.string().trim().max(200).optional(),
    facebook: z.string().trim().max(512).optional(),
    insideViewKey: z.string().min(1, 'Inside view is required'),
    insideViewUrl: z.string().max(2048).optional(),
    outsideViewKey: z.string().min(1, 'Outside view is required'),
    outsideViewUrl: z.string().max(2048).optional(),
    adminName: z.string().trim().min(2).max(255),
    adminEmail: z.string().trim().email(),
    adminPhone: z.string().trim().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number'),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .superRefine((v, ctx) => {
    if (v.password !== v.confirmPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Passwords do not match', path: ['confirmPassword'] });
    }
  });

export type BranchRequestFormInput = z.infer<typeof branchRequestFormSchema>;
