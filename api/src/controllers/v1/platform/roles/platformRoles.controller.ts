import type { Request, Response } from 'express';
import { z } from 'zod';

import { getDataSource } from '../../../../config/database.js';
import { PlatformPermission } from '../../../../entities/PlatformPermission.js';
import { PlatformRole } from '../../../../entities/PlatformRole.js';
import { PlatformRolePermission } from '../../../../entities/PlatformRolePermission.js';
import { PlatformStaffRole } from '../../../../entities/PlatformStaffRole.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';

const createRoleSchema = z.object({
  name: z.string().min(2).max(128),
  description: z.string().max(500).optional().nullable(),
  permissionCodes: z.array(z.string().min(1)).min(1),
});

const updateRoleSchema = z.object({
  name: z.string().min(2).max(128).optional(),
  description: z.string().max(500).optional().nullable(),
  permissionCodes: z.array(z.string().min(1)).min(1).optional(),
});

export async function listRoles(_req: Request, res: Response): Promise<void> {
  const roles = await getDataSource().getRepository(PlatformRole).find({ order: { createdAt: 'DESC' } });
  res.status(200).json({ roles });
}

export async function getRole(req: Request, res: Response): Promise<void> {
  const roleId = req.params.roleId;
  const role = await getDataSource().getRepository(PlatformRole).findOne({ where: { id: roleId } });
  if (!role) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Role not found');

  const perms = await getDataSource()
    .getRepository(PlatformRolePermission)
    .createQueryBuilder('rp')
    .innerJoin(PlatformPermission, 'p', 'p.id = rp.permissionId')
    .select(['p.code AS code'])
    .where('rp.roleId = :roleId', { roleId })
    .getRawMany<{ code: string }>();

  res.status(200).json({ role, permissionCodes: perms.map((p) => p.code) });
}

export async function createRole(req: Request, res: Response): Promise<void> {
  const parsed = createRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());
  }

  const ds = getDataSource();
  await ds.transaction(async (tx) => {
    const roleRepo = tx.getRepository(PlatformRole);
    const permRepo = tx.getRepository(PlatformPermission);
    const joinRepo = tx.getRepository(PlatformRolePermission);

    const role = roleRepo.create({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    });
    await roleRepo.save(role);

    const perms = await permRepo.find({ where: parsed.data.permissionCodes.map((code) => ({ code })) });
    if (perms.length !== parsed.data.permissionCodes.length) {
      throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Unknown permission code');
    }

    await joinRepo.insert(perms.map((p) => joinRepo.create({ roleId: role.id, permissionId: p.id })));

    res.status(201).json({ roleId: role.id });
  });
}

export async function updateRole(req: Request, res: Response): Promise<void> {
  const roleId = req.params.roleId;
  const parsed = updateRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());
  }

  const ds = getDataSource();
  await ds.transaction(async (tx) => {
    const roleRepo = tx.getRepository(PlatformRole);
    const permRepo = tx.getRepository(PlatformPermission);
    const joinRepo = tx.getRepository(PlatformRolePermission);

    const role = await roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Role not found');

    if (typeof parsed.data.name === 'string') role.name = parsed.data.name;
    if (parsed.data.description !== undefined) role.description = parsed.data.description ?? null;
    await roleRepo.save(role);

    if (parsed.data.permissionCodes) {
      const perms = await permRepo.find({ where: parsed.data.permissionCodes.map((code) => ({ code })) });
      if (perms.length !== parsed.data.permissionCodes.length) {
        throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Unknown permission code');
      }

      await joinRepo.delete({ roleId });
      await joinRepo.insert(perms.map((p) => joinRepo.create({ roleId, permissionId: p.id })));
    }

    res.status(200).json({ ok: true });
  });
}

export async function listPermissions(_req: Request, res: Response): Promise<void> {
  const perms = await getDataSource()
    .getRepository(PlatformPermission)
    .find({ order: { code: 'ASC' } });
  res.status(200).json({ permissions: perms });
}

export async function deleteRole(req: Request, res: Response): Promise<void> {
  const roleId = req.params.roleId;
  const ds = getDataSource();

  await ds.transaction(async (tx) => {
    const roleRepo = tx.getRepository(PlatformRole);
    const staffRoleRepo = tx.getRepository(PlatformStaffRole);
    const joinRepo = tx.getRepository(PlatformRolePermission);

    const role = await roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Role not found');

    const assigned = await staffRoleRepo.findOne({ where: { roleId } });
    if (assigned) {
      throw new AppError(409, ErrorCodes.CONFLICT, 'Role is assigned to staff users');
    }

    await joinRepo.delete({ roleId });
    await roleRepo.delete({ id: roleId });

    res.status(200).json({ ok: true });
  });
}

