import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from './Branch.js';

@Entity({ name: 'merchant_branch_photos' })
export class MerchantBranchPhoto {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

  @Column({ type: 'varchar', length: 32 })
  kind!: string;

  @Column({ name: 's3_key', type: 'varchar', length: 1024 })
  s3Key!: string;

  @Column({ name: 'sort_order', type: 'int', nullable: true })
  sortOrder!: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
