import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Invoice } from './Invoice.js';
import { Merchant } from './Merchant.js';

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchant_id' })
  merchant!: Merchant;

  @ManyToOne(() => Invoice, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'invoice_id' })
  invoice!: Invoice | null;

  @Column({ name: 'amount_paise', type: 'bigint' })
  amountPaise!: string;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({ name: 'razorpay_payment_id', type: 'varchar', length: 255, nullable: true })
  razorpayPaymentId!: string | null;

  @Column({ name: 'razorpay_order_id', type: 'varchar', length: 255, nullable: true })
  razorpayOrderId!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  method!: string | null;

  @Column({ name: 'raw_webhook_payload_id', type: 'uuid', nullable: true })
  rawWebhookPayloadId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
