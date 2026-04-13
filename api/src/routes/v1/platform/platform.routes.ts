import type { Express } from 'express';

import { AdminPermissions } from '../../../constants/permissions.js';
import { adminLogin, adminMe } from '../../../controllers/v1/platform/auth/adminAuth.controller.js';
import {
  approveMerchantApplication,
  getMerchantApplication,
  listMerchantApplications,
  rejectMerchantApplication,
  updateMerchantApplication,
} from '../../../controllers/v1/platform/merchantApplications/platformMerchantApplications.controller.js';
import { deleteMerchant, getMerchant, listMerchants, updateMerchant } from '../../../controllers/v1/platform/merchants/platformMerchants.controller.js';
import {
  createRole,
  deleteRole,
  getRole,
  listPermissions,
  listRoles,
  updateRole,
} from '../../../controllers/v1/platform/roles/platformRoles.controller.js';
import {
  createStaff,
  deleteStaff,
  getStaff,
  listStaff,
  updateStaff,
} from '../../../controllers/v1/platform/staff/platformStaff.controller.js';
import { asyncHandler } from '../../../lib/http/asyncHandler.js';
import { adminAuthMiddleware } from '../../../middleware/adminAuth.js';
import { requireAdminPermission } from '../../../middleware/adminPermission.js';

export function registerPlatformRoutes(app: Express): void {
  app.post('/v1/platform/auth/login', asyncHandler(adminLogin));
  app.get('/v1/platform/auth/me', adminAuthMiddleware, adminMe);

  // Permissions list is required to create/edit roles, so we guard it with ROLES_LIST.
  app.get('/v1/platform/permissions', adminAuthMiddleware, requireAdminPermission(AdminPermissions.ROLES_LIST), asyncHandler(listPermissions));

  app.get('/v1/platform/roles', adminAuthMiddleware, requireAdminPermission(AdminPermissions.ROLES_LIST), asyncHandler(listRoles));
  app.post('/v1/platform/roles', adminAuthMiddleware, requireAdminPermission(AdminPermissions.ROLES_CREATE), asyncHandler(createRole));
  app.get('/v1/platform/roles/:roleId', adminAuthMiddleware, requireAdminPermission(AdminPermissions.ROLES_VIEW), asyncHandler(getRole));
  app.patch('/v1/platform/roles/:roleId', adminAuthMiddleware, requireAdminPermission(AdminPermissions.ROLES_EDIT), asyncHandler(updateRole));
  app.delete('/v1/platform/roles/:roleId', adminAuthMiddleware, requireAdminPermission(AdminPermissions.ROLES_DELETE), asyncHandler(deleteRole));

  app.get('/v1/platform/staff', adminAuthMiddleware, requireAdminPermission(AdminPermissions.ADMIN_USERS_LIST), asyncHandler(listStaff));
  app.post('/v1/platform/staff', adminAuthMiddleware, requireAdminPermission(AdminPermissions.ADMIN_USERS_CREATE), asyncHandler(createStaff));
  app.get('/v1/platform/staff/:staffId', adminAuthMiddleware, requireAdminPermission(AdminPermissions.ADMIN_USERS_VIEW), asyncHandler(getStaff));
  app.patch('/v1/platform/staff/:staffId', adminAuthMiddleware, requireAdminPermission(AdminPermissions.ADMIN_USERS_EDIT), asyncHandler(updateStaff));
  app.delete('/v1/platform/staff/:staffId', adminAuthMiddleware, requireAdminPermission(AdminPermissions.ADMIN_USERS_DELETE), asyncHandler(deleteStaff));

  app.get(
    '/v1/platform/merchant-applications',
    adminAuthMiddleware,
    requireAdminPermission(AdminPermissions.MERCHANT_APPLICATIONS_LIST),
    asyncHandler(listMerchantApplications),
  );
  app.get(
    '/v1/platform/merchant-applications/:applicationId',
    adminAuthMiddleware,
    requireAdminPermission(AdminPermissions.MERCHANT_APPLICATIONS_VIEW),
    asyncHandler(getMerchantApplication),
  );
  app.patch(
    '/v1/platform/merchant-applications/:applicationId',
    adminAuthMiddleware,
    requireAdminPermission(AdminPermissions.MERCHANT_APPLICATIONS_EDIT),
    asyncHandler(updateMerchantApplication),
  );
  app.post(
    '/v1/platform/merchant-applications/:applicationId/approve',
    adminAuthMiddleware,
    requireAdminPermission(AdminPermissions.MERCHANT_APPLICATIONS_REVIEW),
    asyncHandler(approveMerchantApplication),
  );
  app.post(
    '/v1/platform/merchant-applications/:applicationId/reject',
    adminAuthMiddleware,
    requireAdminPermission(AdminPermissions.MERCHANT_APPLICATIONS_REVIEW),
    asyncHandler(rejectMerchantApplication),
  );

  app.get(
    '/v1/platform/merchants',
    adminAuthMiddleware,
    requireAdminPermission(AdminPermissions.MERCHANTS_LIST),
    asyncHandler(listMerchants),
  );
  app.get(
    '/v1/platform/merchants/:merchantId',
    adminAuthMiddleware,
    requireAdminPermission(AdminPermissions.MERCHANTS_VIEW),
    asyncHandler(getMerchant),
  );
  app.patch(
    '/v1/platform/merchants/:merchantId',
    adminAuthMiddleware,
    requireAdminPermission(AdminPermissions.MERCHANTS_EDIT),
    asyncHandler(updateMerchant),
  );
  app.delete(
    '/v1/platform/merchants/:merchantId',
    adminAuthMiddleware,
    requireAdminPermission(AdminPermissions.MERCHANTS_DELETE),
    asyncHandler(deleteMerchant),
  );
}

