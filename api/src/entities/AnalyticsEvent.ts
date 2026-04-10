import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'analytics_events' })
@Index(['occurredAt'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'event_type', type: 'varchar', length: 128 })
  eventType!: string;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId!: string | null;

  @Column({ name: 'merchant_id', type: 'uuid', nullable: true })
  merchantId!: string | null;

  @Column({ name: 'offer_id', type: 'uuid', nullable: true })
  offerId!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: unknown;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: Date;
}
