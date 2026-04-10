import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'subscription_plans' })
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'max_loyalty_cards', type: 'int', nullable: true })
  maxLoyaltyCards!: number | null;

  @Column({ name: 'max_active_customers', type: 'int', nullable: true })
  maxActiveCustomers!: number | null;

  @Column({ name: 'max_monthly_push_notifications', type: 'int', nullable: true })
  maxMonthlyPushNotifications!: number | null;

  @Column({ name: 'max_concurrent_special_offers', type: 'int', nullable: true })
  maxConcurrentSpecialOffers!: number | null;

  @Column({ name: 'allowed_campaign_types', type: 'jsonb', nullable: true })
  allowedCampaignTypes!: unknown;

  @Column({ name: 'analytics_tier', type: 'varchar', length: 64, nullable: true })
  analyticsTier!: string | null;

  @Column({ name: 'support_sla_tier', type: 'varchar', length: 64, nullable: true })
  supportSlaTier!: string | null;

  @Column({ name: 'qr_standee_entitlement', type: 'jsonb', nullable: true })
  qrStandeeEntitlement!: unknown;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
