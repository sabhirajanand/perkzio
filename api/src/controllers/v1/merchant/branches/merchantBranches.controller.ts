import type { Request, Response } from 'express';

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

  let branches: Branch[];
  if (auth.role === 'BRANCH_ADMIN') {
    if (!auth.branchId) {
      branches = [];
    } else {
      const one = await branchRepo.findOne({
        where: { id: auth.branchId, merchant: { id: auth.merchantId } },
      });
      branches = one ? [one] : [];
    }
  } else if (auth.role === 'MERCHANT_ADMIN') {
    branches = await branchRepo.find({
      where: { merchant: { id: auth.merchantId } },
      order: { isHeadBranch: 'DESC', createdAt: 'ASC' },
    });
  } else {
    throw new AppError(403, ErrorCodes.FORBIDDEN, 'Unsupported role');
  }

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
    branches: branches.map((b) => ({
      ...formatBranch(b),
      branchAdminEmail: emailByBranchId.get(b.id) ?? null,
    })),
  });
}
