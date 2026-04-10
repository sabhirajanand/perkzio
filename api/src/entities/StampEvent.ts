import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from './Branch.js';
import { Campaign } from './Campaign.js';
import { Customer } from './Customer.js';
import { CustomerCardEnrolment } from './CustomerCardEnrolment.js';
import { LoyaltyCard } from './LoyaltyCard.js';
import { Merchant } from './Merchant.js';
import { MerchantUser } from './MerchantUser.js';

@Entity({ name: 'stamp_events' })
@Index(['merchant', 'occurredAt'])
@Index(['customer', 'occurredAt'])
export class StampEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchant_id' })
  merchant!: Merchant;

  @ManyToOne(() => Branch, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

  @ManyToOne(() => LoyaltyCard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loyalty_card_id' })
  loyaltyCard!: LoyaltyCard;

  @ManyToOne(() => CustomerCardEnrolment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrolment_id' })
  enrolment!: CustomerCardEnrolment;

  @ManyToOne(() => Campaign, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'campaign_id' })
  campaign!: Campaign | null;

  @Column({ name: 'trust_mode', type: 'varchar', length: 64 })
  trustMode!: string;

  @Column({ name: 'client_event_id', type: 'varchar', length: 255, nullable: true })
  clientEventId!: string | null;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 255, nullable: true })
  idempotencyKey!: string | null;

  @ManyToOne(() => MerchantUser, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'merchant_user_id' })
  merchantUser!: MerchantUser | null;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: Date;

  @Column({ name: 'synced_at', type: 'timestamptz', nullable: true })
  syncedAt!: Date | null;

  @Column({ name: 'offline_batch_id', type: 'uuid', nullable: true })
  offlineBatchId!: string | null;

  @Column({ name: 'signature_payload', type: 'jsonb', nullable: true })
  signaturePayload!: unknown;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
