import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Merchant } from './Merchant.js';
import { MerchantOnboardingApplication } from './MerchantOnboardingApplication.js';

@Entity({ name: 'merchant_kyc_documents' })
@Index(['merchant'])
export class MerchantKycDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Merchant, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchant_id' })
  merchant!: Merchant | null;

  @ManyToOne(() => MerchantOnboardingApplication, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchant_onboarding_application_id' })
  application!: MerchantOnboardingApplication | null;

  @Column({ name: 'document_type', type: 'varchar', length: 64 })
  documentType!: string;

  @Column({ name: 's3_bucket', type: 'varchar', length: 255 })
  s3Bucket!: string;

  @Column({ name: 's3_key', type: 'varchar', length: 1024 })
  s3Key!: string;

  @Column({ name: 'content_type', type: 'varchar', length: 128, nullable: true })
  contentType!: string | null;

  @Column({ name: 'size_bytes', type: 'bigint', nullable: true })
  sizeBytes!: string | null;

  @Column({ name: 'uploaded_at', type: 'timestamptz' })
  uploadedAt!: Date;
}
