import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'cms_banners' })
export class CmsBanner {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  placement!: string;

  @Column({ name: 'image_s3_key', type: 'varchar', length: 1024, nullable: true })
  imageS3Key!: string | null;

  @Column({ name: 'link_type', type: 'varchar', length: 64, nullable: true })
  linkType!: string | null;

  @Column({ name: 'link_payload', type: 'jsonb', nullable: true })
  linkPayload!: unknown;

  @Column({ name: 'sort_order', type: 'int', nullable: true })
  sortOrder!: number | null;

  @Column({ name: 'active_from', type: 'timestamptz', nullable: true })
  activeFrom!: Date | null;

  @Column({ name: 'active_to', type: 'timestamptz', nullable: true })
  activeTo!: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
