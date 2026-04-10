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
import { SubscriptionPlan } from './SubscriptionPlan.js';

@Entity({ name: 'merchant_subscriptions' })
@Index(['merchant'], { unique: true })
export class MerchantSubscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchant_id' })
  merchant!: Merchant;

  @ManyToOne(() => SubscriptionPlan, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plan_id' })
  plan!: SubscriptionPlan;

  @Column({ name: 'billing_period', type: 'varchar', length: 32 })
  billingPeriod!: string;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({ name: 'current_period_start', type: 'timestamptz', nullable: true })
  currentPeriodStart!: Date | null;

  @Column({ name: 'current_period_end', type: 'timestamptz', nullable: true })
  currentPeriodEnd!: Date | null;

  @Column({ name: 'cancel_at_period_end', type: 'boolean', nullable: true })
  cancelAtPeriodEnd!: boolean | null;

  @Column({ name: 'razorpay_subscription_id', type: 'varchar', length: 255, nullable: true })
  razorpaySubscriptionId!: string | null;

  @Column({ name: 'limited_mode_since', type: 'timestamptz', nullable: true })
  limitedModeSince!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
