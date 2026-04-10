export const AdminPermissions = {
  ROLES_LIST: 'ADMIN_ROLES_LIST',
  ROLES_VIEW: 'ADMIN_ROLES_VIEW',
  ROLES_CREATE: 'ADMIN_ROLES_CREATE',
  ROLES_EDIT: 'ADMIN_ROLES_EDIT',
  ROLES_DELETE: 'ADMIN_ROLES_DELETE',

  ADMIN_USERS_LIST: 'ADMIN_USERS_LIST',
  ADMIN_USERS_VIEW: 'ADMIN_USERS_VIEW',
  ADMIN_USERS_CREATE: 'ADMIN_USERS_CREATE',
  ADMIN_USERS_EDIT: 'ADMIN_USERS_EDIT',
  ADMIN_USERS_DELETE: 'ADMIN_USERS_DELETE',
} as const;

export type AdminPermissionCode = (typeof AdminPermissions)[keyof typeof AdminPermissions];

export const ALL_ADMIN_PERMISSION_CODES: AdminPermissionCode[] = Object.values(AdminPermissions);

