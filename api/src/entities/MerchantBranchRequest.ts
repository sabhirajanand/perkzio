import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Merchant } from './Merchant.js';
import { PlatformStaff } from './PlatformStaff.js';

@Entity({ name: 'merchant_branch_requests' })
@Index(['merchant'])
@Index(['status'])
export class MerchantBranchRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchant_id' })
  merchant!: Merchant;

  @Column({ name: 'branch_name', type: 'varchar', length: 255 })
  branchName!: string;

  @Column({ type: 'varchar', length: 32, default: 'PENDING' })
  status!: string;

  @Column({ type: 'jsonb' })
  payload!: unknown;

  @Column({ name: 'admin_email', type: 'citext' })
  adminEmail!: string;

  @Column({ name: 'admin_name', type: 'varchar', length: 255, nullable: true })
  adminName!: string | null;

  @Column({ name: 'admin_phone', type: 'varchar', length: 32, nullable: true })
  adminPhone!: string | null;

  @Column({ name: 'admin_password_hash', type: 'varchar', length: 255 })
  adminPasswordHash!: string;

  @ManyToOne(() => PlatformStaff, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_staff_id' })
  reviewedByStaff!: PlatformStaff | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt!: Date | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason!: string | null;

  @Column({ name: 'resolved_branch_id', type: 'uuid', nullable: true })
  resolvedBranchId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
