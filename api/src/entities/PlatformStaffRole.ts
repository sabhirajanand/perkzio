import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'platform_staff_roles' })
export class PlatformStaffRole {
  @PrimaryColumn('uuid', { name: 'staff_id' })
  staffId!: string;

  @PrimaryColumn('uuid', { name: 'role_id' })
  roleId!: string;
}
