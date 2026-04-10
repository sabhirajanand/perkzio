import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Branch } from './Branch.js';
import { Customer } from './Customer.js';
import { MerchantUser } from './MerchantUser.js';
import { OfferRedemptionSession } from './OfferRedemptionSession.js';
import { SpecialOffer } from './SpecialOffer.js';

@Entity({ name: 'offer_redemptions' })
export class OfferRedemption {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => SpecialOffer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offer_id' })
  offer!: SpecialOffer;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

  @ManyToOne(() => MerchantUser, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'merchant_user_id' })
  merchantUser!: MerchantUser | null;

  @ManyToOne(() => OfferRedemptionSession, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'redemption_session_id' })
  redemptionSession!: OfferRedemptionSession | null;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({ name: 'redeemed_at', type: 'timestamptz' })
  redeemedAt!: Date;

  @Column({ name: 'voided_at', type: 'timestamptz', nullable: true })
  voidedAt!: Date | null;

  @Column({ name: 'void_reason', type: 'text', nullable: true })
  voidReason!: string | null;
}
