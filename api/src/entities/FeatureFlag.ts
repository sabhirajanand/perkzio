import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'feature_flags' })
export class FeatureFlag {
  @PrimaryColumn({ type: 'varchar', length: 128 })
  key!: string;

  @Column({ name: 'value_json', type: 'jsonb', nullable: true })
  valueJson!: unknown;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
