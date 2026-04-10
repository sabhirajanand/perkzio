import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from './Customer.js';
import { SpecialOffer } from './SpecialOffer.js';

@Entity({ name: 'offer_redemption_sessions' })
export class OfferRedemptionSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => SpecialOffer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offer_id' })
  offer!: SpecialOffer;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @Column({ name: 'token_hash', type: 'varchar', length: 255 })
  tokenHash!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'consumed_at', type: 'timestamptz', nullable: true })
  consumedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
