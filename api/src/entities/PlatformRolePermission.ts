import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'platform_role_permissions' })
export class PlatformRolePermission {
  @PrimaryColumn('uuid', { name: 'role_id' })
  roleId!: string;

  @PrimaryColumn('uuid', { name: 'permission_id' })
  permissionId!: string;
}
