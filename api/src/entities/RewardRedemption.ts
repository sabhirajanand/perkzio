import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from './Branch.js';
import { Customer } from './Customer.js';
import { CustomerCardEnrolment } from './CustomerCardEnrolment.js';
import { LoyaltyCard } from './LoyaltyCard.js';
import { LoyaltyCardReward } from './LoyaltyCardReward.js';

@Entity({ name: 'reward_redemptions' })
export class RewardRedemption {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @ManyToOne(() => LoyaltyCard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loyalty_card_id' })
  loyaltyCard!: LoyaltyCard;

  @ManyToOne(() => LoyaltyCardReward, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loyalty_reward_id' })
  loyaltyReward!: LoyaltyCardReward;

  @ManyToOne(() => CustomerCardEnrolment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrolment_id' })
  enrolment!: CustomerCardEnrolment;

  @ManyToOne(() => Branch, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch | null;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({ name: 'geo_validated', type: 'boolean', nullable: true })
  geoValidated!: boolean | null;

  @Column({ name: 'timer_expires_at', type: 'timestamptz', nullable: true })
  timerExpiresAt!: Date | null;

  @Column({ name: 'redeemed_at', type: 'timestamptz', nullable: true })
  redeemedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
