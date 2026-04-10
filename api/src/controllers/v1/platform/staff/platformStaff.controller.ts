import type { Request, Response } from 'express';
import { z } from 'zod';

import { getDataSource } from '../../../../config/database.js';
import { PlatformRole } from '../../../../entities/PlatformRole.js';
import { PlatformStaff } from '../../../../entities/PlatformStaff.js';
import { PlatformStaffRole } from '../../../../entities/PlatformStaffRole.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';
import { hashPassword } from '../../../../lib/auth/password.js';

const createStaffSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(255).optional().nullable(),
  status: z.string().min(1).default('ACTIVE'),
  roleId: z.string().uuid(),
});

const updateStaffSchema = z.object({
  fullName: z.string().min(2).max(255).optional().nullable(),
  status: z.string().min(1).optional(),
  roleId: z.string().uuid().optional(),
});

export async function listStaff(_req: Request, res: Response): Promise<void> {
  const staff = await getDataSource()
    .getRepository(PlatformStaff)
    .find({ order: { createdAt: 'DESC' } });
  res.status(200).json({ staff });
}

export async function getStaff(req: Request, res: Response): Promise<void> {
  const staffId = req.params.staffId;
  const staff = await getDataSource().getRepository(PlatformStaff).findOne({ where: { id: staffId } });
  if (!staff) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Staff not found');
  const staffRole = await getDataSource().getRepository(PlatformStaffRole).findOne({ where: { staffId } });
  res.status(200).json({ staff, roleId: staffRole?.roleId ?? null });
}

export async function createStaff(req: Request, res: Response): Promise<void> {
  const parsed = createStaffSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());
  }

  const ds = getDataSource();
  await ds.transaction(async (tx) => {
    const staffRepo = tx.getRepository(PlatformStaff);
    const roleRepo = tx.getRepository(PlatformRole);
    const staffRoleRepo = tx.getRepository(PlatformStaffRole);

    const role = await roleRepo.findOne({ where: { id: parsed.data.roleId } });
    if (!role) throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Role not found');

    const existing = await staffRepo.findOne({ where: { email: parsed.data.email.toLowerCase() } });
    if (existing) throw new AppError(409, ErrorCodes.CONFLICT, 'Email already exists');

    const passwordHash = await hashPassword({ password: parsed.data.password });
    const staff = staffRepo.create({
      email: parsed.data.email.toLowerCase(),
      passwordHash,
      fullName: parsed.data.fullName ?? null,
      status: parsed.data.status,
      mfaEnabled: false,
    });
    await staffRepo.save(staff);

    await staffRoleRepo.insert(staffRoleRepo.create({ staffId: staff.id, roleId: role.id }));

    res.status(201).json({ staffId: staff.id });
  });
}

export async function updateStaff(req: Request, res: Response): Promise<void> {
  const staffId = req.params.staffId;
  const parsed = updateStaffSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());
  }

  const ds = getDataSource();
  await ds.transaction(async (tx) => {
    const staffRepo = tx.getRepository(PlatformStaff);
    const roleRepo = tx.getRepository(PlatformRole);
    const staffRoleRepo = tx.getRepository(PlatformStaffRole);

    const staff = await staffRepo.findOne({ where: { id: staffId } });
    if (!staff) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Staff not found');

    if (parsed.data.fullName !== undefined) staff.fullName = parsed.data.fullName ?? null;
    if (typeof parsed.data.status === 'string') staff.status = parsed.data.status;
    await staffRepo.save(staff);

    if (parsed.data.roleId) {
      const role = await roleRepo.findOne({ where: { id: parsed.data.roleId } });
      if (!role) throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Role not found');

      await staffRoleRepo.delete({ staffId });
      await staffRoleRepo.insert(staffRoleRepo.create({ staffId, roleId: role.id }));
    }

    res.status(200).json({ ok: true });
  });
}

export async function deleteStaff(req: Request, res: Response): Promise<void> {
  const staffId = req.params.staffId;
  const ds = getDataSource();

  await ds.transaction(async (tx) => {
    const staffRepo = tx.getRepository(PlatformStaff);
    const staffRoleRepo = tx.getRepository(PlatformStaffRole);

    const staff = await staffRepo.findOne({ where: { id: staffId } });
    if (!staff) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Staff not found');

    staff.status = 'DEACTIVATED';
    await staffRepo.save(staff);
    await staffRoleRepo.delete({ staffId });

    res.status(200).json({ ok: true });
  });
}

