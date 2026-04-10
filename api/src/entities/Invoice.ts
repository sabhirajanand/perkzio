import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Merchant } from './Merchant.js';
import { MerchantSubscription } from './MerchantSubscription.js';

@Entity({ name: 'invoices' })
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchant_id' })
  merchant!: Merchant;

  @ManyToOne(() => MerchantSubscription, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'subscription_id' })
  subscription!: MerchantSubscription | null;

  @Column({ name: 'invoice_number', type: 'varchar', length: 64, unique: true })
  invoiceNumber!: string;

  @Column({ name: 'amount_paise', type: 'bigint', nullable: true })
  amountPaise!: string | null;

  @Column({ name: 'gst_amount_paise', type: 'bigint', nullable: true })
  gstAmountPaise!: string | null;

  @Column({ type: 'varchar', length: 8, default: 'INR' })
  currency!: string;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({ name: 'razorpay_invoice_id', type: 'varchar', length: 255, nullable: true })
  razorpayInvoiceId!: string | null;

  @Column({ name: 'pdf_s3_key', type: 'varchar', length: 1024, nullable: true })
  pdfS3Key!: string | null;

  @Column({ name: 'issued_at', type: 'timestamptz', nullable: true })
  issuedAt!: Date | null;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt!: Date | null;
}
