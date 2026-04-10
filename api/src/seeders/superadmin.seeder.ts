import { loadEnv } from '../config/env.js';
import { getDataSource } from '../config/database.js';
import { PlatformStaff } from '../entities/PlatformStaff.js';
import { hashPassword } from '../lib/auth/password.js';

export async function seedDefaultSuperadmin(): Promise<void> {
  const env = loadEnv();
  const email = env.SUPERADMIN_EMAILS[0];
  if (!email) return;

  const password = process.env.SUPERADMIN_DEFAULT_PASSWORD?.trim();
  if (!password) return;

  const repo = getDataSource().getRepository(PlatformStaff);
  const existing = await repo.findOne({ where: { email } });
  if (existing) {
    if (!existing.passwordHash) {
      existing.passwordHash = await hashPassword({ password });
      existing.status = existing.status || 'ACTIVE';
      await repo.save(existing);
    }
    return;
  }

  const staff = repo.create({
    email,
    passwordHash: await hashPassword({ password }),
    fullName: 'Superadmin',
    status: 'ACTIVE',
    mfaEnabled: false,
  });
  await repo.save(staff);
}

