import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors/AppError.js';
import { ErrorCodes } from '../errors/codes.js';

export function requireAdminPermission(permissionCode: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth || (req.auth.userType !== 'ADMIN' && req.auth.userType !== 'SUPERADMIN')) {
      return next(new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthorized'));
    }

    if (req.auth.userType === 'SUPERADMIN') {
      return next();
    }

    const perms = req.auth.staff?.permissions ?? [];
    if (!perms.includes(permissionCode)) {
      return next(new AppError(403, ErrorCodes.FORBIDDEN, 'Forbidden'));
    }

    return next();
  };
}

