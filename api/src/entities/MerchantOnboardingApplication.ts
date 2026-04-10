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
import { SubscriptionPlan } from './SubscriptionPlan.js';

@Entity({ name: 'merchant_onboarding_applications' })
export class MerchantOnboardingApplication {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'reference_number', type: 'varchar', length: 64 })
  @Index({ unique: true })
  referenceNumber!: string;

  @Column({ type: 'varchar', length: 64 })
  status!: string;

  @Column({ name: 'business_payload', type: 'jsonb', nullable: true })
  businessPayload!: unknown;

  @ManyToOne(() => SubscriptionPlan, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'selected_plan_id' })
  selectedPlan!: SubscriptionPlan | null;

  @Column({ name: 'razorpay_order_id', type: 'varchar', length: 255, nullable: true })
  razorpayOrderId!: string | null;

  @ManyToOne(() => Merchant, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'merchant_id' })
  merchant!: Merchant | null;

  @ManyToOne(() => PlatformStaff, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by_staff_id' })
  reviewedByStaff!: PlatformStaff | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
