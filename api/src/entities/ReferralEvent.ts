import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from './Customer.js';
import { MerchantOnboardingApplication } from './MerchantOnboardingApplication.js';

@Entity({ name: 'referral_events' })
export class ReferralEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'program_code', type: 'varchar', length: 64, nullable: true })
  programCode!: string | null;

  @Column({ name: 'referrer_type', type: 'varchar', length: 64 })
  referrerType!: string;

  @ManyToOne(() => Customer, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'referrer_customer_id' })
  referrerCustomer!: Customer | null;

  @ManyToOne(() => MerchantOnboardingApplication, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'referred_merchant_application_id' })
  referredMerchantApplication!: MerchantOnboardingApplication | null;

  @Column({ name: 'referral_code_used', type: 'varchar', length: 128, nullable: true })
  referralCodeUsed!: string | null;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
