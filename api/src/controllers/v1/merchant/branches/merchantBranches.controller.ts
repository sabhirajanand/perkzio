import type { Request, Response } from 'express';
import { z } from 'zod';

import { getDataSource } from '../../../../config/database.js';
import { Branch } from '../../../../entities/Branch.js';
import { MerchantUser } from '../../../../entities/MerchantUser.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';

function formatBranch(b: Branch) {
  return {
    id: b.id,
    name: b.name,
    status: b.status,
    isHeadBranch: b.isHeadBranch,
    address: b.address ?? null,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

export async function listBranches(req: Request, res: Response): Promise<void> {
  const auth = req.auth?.merchant;
  if (!auth) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthenticated');

  const ds = getDataSource();
  const branchRepo = ds.getRepository(Branch);
  const userRepo = ds.getRepository(MerchantUser);

  const query = z
    .object({
      q: z.string().trim().min(1).optional(),
      status: z.string().trim().min(1).optional(),
      createdFrom: z.string().trim().min(1).optional(),
      createdTo: z.string().trim().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      offset: z.coerce.number().int().min(0).default(0),
    })
    .safeParse(req.query);
  if (!query.success) throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid query', query.error.flatten());

  let qb = branchRepo
    .createQueryBuilder('b')
    .where('b.merchant_id = :merchantId', { merchantId: auth.merchantId })
    .orderBy('b.is_head_branch', 'DESC')
    .addOrderBy('b.created_at', 'ASC');

  if (auth.role === 'BRANCH_ADMIN') {
    if (!auth.branchId) {
      res.json({ ok: true, viewerRole: auth.role, total: 0, limit: query.data.limit, offset: query.data.offset, branches: [] });
      return;
    }
    qb = qb.andWhere('b.id = :branchId', { branchId: auth.branchId });
  } else if (auth.role !== 'MERCHANT_ADMIN') {
    throw new AppError(403, ErrorCodes.FORBIDDEN, 'Unsupported role');
  }

  if (query.data.q) {
    qb = qb.andWhere('b.name ILIKE :q', { q: `%${query.data.q}%` });
  }
  if (query.data.status) {
    qb = qb.andWhere('b.status = :status', { status: query.data.status });
  }
  if (query.data.createdFrom) {
    const from = new Date(query.data.createdFrom);
    if (!Number.isNaN(from.getTime())) qb = qb.andWhere('b.created_at >= :createdFrom', { createdFrom: from.toISOString() });
  }
  if (query.data.createdTo) {
    const to = new Date(query.data.createdTo);
    if (!Number.isNaN(to.getTime())) {
      const endExclusive = new Date(to);
      endExclusive.setDate(endExclusive.getDate() + 1);
      qb = qb.andWhere('b.created_at < :createdTo', { createdTo: endExclusive.toISOString() });
    }
  }

  const totalRow = await qb
    .clone()
    .orderBy()
    .select('COUNT(*)', 'count')
    .getRawOne<{ count: string }>();
  const total = Number(totalRow?.count ?? 0);

  const branches = await qb.take(query.data.limit).skip(query.data.offset).getMany();

  const admins = await userRepo.find({
    where: { merchant: { id: auth.merchantId }, role: 'BRANCH_ADMIN' },
    relations: { branch: true },
  });
  const emailByBranchId = new Map<string, string>();
  for (const u of admins) {
    if (u.branch?.id && !emailByBranchId.has(u.branch.id)) {
      emailByBranchId.set(u.branch.id, u.email);
    }
  }

  res.json({
    ok: true,
    viewerRole: auth.role,
    total,
    limit: query.data.limit,
    offset: query.data.offset,
    branches: branches.map((b) => ({
      ...formatBranch(b),
      branchAdminEmail: emailByBranchId.get(b.id) ?? null,
    })),
  });
}

const updateBranchBody = z.object({
  address: z
    .object({
      line1: z.string().trim().min(1).max(500).optional(),
      city: z.string().trim().min(1).max(120).optional(),
      state: z.string().trim().min(1).max(120).optional(),
      pinCode: z.string().trim().min(1).max(32).optional(),
      mapsUrl: z.string().trim().min(1).max(2000).optional(),
    })
    .optional(),
  socialLinks: z
    .object({
      website: z.string().trim().max(512).optional(),
      instagram: z.string().trim().max(200).optional(),
      facebook: z.string().trim().max(512).optional(),
      googleBusinessUrl: z.string().trim().max(512).optional(),
    })
    .optional(),
});

export async function updateBranch(req: Request, res: Response): Promise<void> {
  const auth = req.auth?.merchant;
  if (!auth) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthenticated');
  if (auth.role !== 'MERCHANT_ADMIN') throw new AppError(403, ErrorCodes.FORBIDDEN, 'Only merchant admins can edit branches');

  const branchId = z.string().uuid().parse(req.params.branchId);
  const parsed = updateBranchBody.safeParse(req.body);
  if (!parsed.success) throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());

  const repo = getDataSource().getRepository(Branch);
  const branch = await repo.findOne({ where: { id: branchId, merchant: { id: auth.merchantId } } });
  if (!branch) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Branch not found');

  if (parsed.data.address) {
    const nextAddr = { ...(branch.address && typeof branch.address === 'object' ? (branch.address as Record<string, unknown>) : {}) };
    for (const [k, v] of Object.entries(parsed.data.address)) {
      if (typeof v === 'string') nextAddr[k] = v;
    }
    branch.address = nextAddr;
  }
  if (parsed.data.socialLinks) {
    const nextLinks = { ...(branch.socialLinks && typeof branch.socialLinks === 'object' ? (branch.socialLinks as Record<string, unknown>) : {}) };
    for (const [k, v] of Object.entries(parsed.data.socialLinks)) {
      if (typeof v === 'string') nextLinks[k] = v;
    }
    branch.socialLinks = nextLinks;
  }

  await repo.save(branch);
  res.json({ ok: true, branch: formatBranch(branch) });
}
