import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Merchant } from './Merchant.js';

@Entity({ name: 'branches' })
@Index(['merchant'])
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchant_id' })
  merchant!: Merchant;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'is_head_branch', type: 'boolean', default: false })
  isHeadBranch!: boolean;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({ type: 'jsonb', nullable: true })
  address!: unknown;

  @Column({ name: 'google_maps_place_id', type: 'varchar', length: 255, nullable: true })
  googleMapsPlaceId!: string | null;

  @Column({ type: 'double precision', nullable: true })
  latitude!: number | null;

  @Column({ type: 'double precision', nullable: true })
  longitude!: number | null;

  @Column({ name: 'opening_hours', type: 'jsonb', nullable: true })
  openingHours!: unknown;

  @Column({ name: 'social_links', type: 'jsonb', nullable: true })
  socialLinks!: unknown;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
