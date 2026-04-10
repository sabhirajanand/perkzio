import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Merchant } from './Merchant.js';

@Entity({ name: 'loyalty_cards' })
export class LoyaltyCard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchant_id' })
  merchant!: Merchant;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({ name: 'stamp_target_count', type: 'int' })
  stampTargetCount!: number;

  @Column({ name: 'visual_theme', type: 'jsonb', nullable: true })
  visualTheme!: unknown;

  @Column({ name: 'marquee_fallback_copy', type: 'text', nullable: true })
  marqueeFallbackCopy!: string | null;

  @Column({ name: 'google_review_url', type: 'varchar', length: 1024, nullable: true })
  googleReviewUrl!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;
}
