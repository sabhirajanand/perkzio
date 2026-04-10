import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Customer } from './Customer.js';
import { LoyaltyCard } from './LoyaltyCard.js';

@Entity({ name: 'customer_card_enrolments' })
@Index(['customer', 'loyaltyCard'])
export class CustomerCardEnrolment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @ManyToOne(() => LoyaltyCard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loyalty_card_id' })
  loyaltyCard!: LoyaltyCard;

  @Column({ name: 'is_favourite', type: 'boolean', default: false })
  isFavourite!: boolean;

  @Column({ name: 'enrolled_at', type: 'timestamptz' })
  enrolledAt!: Date;

  @Column({ name: 'last_activity_at', type: 'timestamptz', nullable: true })
  lastActivityAt!: Date | null;

  @Column({ name: 'current_stamp_count', type: 'int', default: 0 })
  currentStampCount!: number;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
