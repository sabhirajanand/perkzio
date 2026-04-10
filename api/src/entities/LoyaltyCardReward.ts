import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LoyaltyCard } from './LoyaltyCard.js';

@Entity({ name: 'loyalty_card_rewards' })
export class LoyaltyCardReward {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => LoyaltyCard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loyalty_card_id' })
  loyaltyCard!: LoyaltyCard;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'sort_order', type: 'int', nullable: true })
  sortOrder!: number | null;
}
