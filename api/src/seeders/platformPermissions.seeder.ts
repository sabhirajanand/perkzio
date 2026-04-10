import { ALL_ADMIN_PERMISSION_CODES } from '../constants/permissions.js';
import { getDataSource } from '../config/database.js';
import { PlatformPermission } from '../entities/PlatformPermission.js';

export async function seedPlatformPermissions(): Promise<void> {
  const repo = getDataSource().getRepository(PlatformPermission);
  for (const code of ALL_ADMIN_PERMISSION_CODES) {
    const existing = await repo.findOne({ where: { code } });
    if (!existing) {
      await repo.insert(repo.create({ code, description: null }));
    }
  }
}

