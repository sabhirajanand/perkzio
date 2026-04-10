import { z } from 'zod';

export const merchantRoleSchema = z.enum(['MERCHANT_ADMIN', 'BRANCH_ADMIN']);
export type MerchantRole = z.infer<typeof merchantRoleSchema>;

export const merchantLoginSchema = z.object({
  role: merchantRoleSchema,
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
});

export type MerchantLoginInput = z.infer<typeof merchantLoginSchema>;
