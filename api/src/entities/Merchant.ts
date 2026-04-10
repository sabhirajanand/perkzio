import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BusinessCategory } from './BusinessCategory.js';

@Entity({ name: 'merchants' })
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'legal_name', type: 'varchar', length: 512 })
  legalName!: string;

  @Column({ name: 'trading_name', type: 'varchar', length: 512, nullable: true })
  tradingName!: string | null;

  @ManyToOne(() => BusinessCategory, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category!: BusinessCategory | null;

  @Column({ type: 'varchar', length: 64 })
  status!: string;

  @Column({ name: 'kyc_status', type: 'varchar', length: 64 })
  kycStatus!: string;

  @Column({ name: 'subscription_limited_mode', type: 'boolean', default: false })
  subscriptionLimitedMode!: boolean;

  @Column({ name: 'primary_business_email', type: 'citext', nullable: true })
  primaryBusinessEmail!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  pan!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  gstin!: string | null;

  @Column({ name: 'registered_address', type: 'jsonb', nullable: true })
  registeredAddress!: unknown;

  @Column({ name: 'referral_code', type: 'varchar', length: 64, nullable: true })
  referralCode!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
