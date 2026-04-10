import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Branch } from './Branch.js';
import { Customer } from './Customer.js';
import { Merchant } from './Merchant.js';
import { MerchantUser } from './MerchantUser.js';
import { PlatformStaff } from './PlatformStaff.js';

@Entity({ name: 'support_tickets' })
export class SupportTicket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'ticket_number', type: 'varchar', length: 32, unique: true })
  ticketNumber!: string;

  @Column({ type: 'varchar', length: 32 })
  channel!: string;

  @ManyToOne(() => Merchant, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'merchant_id' })
  merchant!: Merchant | null;

  @ManyToOne(() => Customer, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer | null;

  @ManyToOne(() => Branch, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch | null;

  @ManyToOne(() => MerchantUser, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'raised_by_merchant_user_id' })
  raisedByMerchantUser!: MerchantUser | null;

  @Column({ type: 'varchar', length: 512 })
  subject!: string;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  priority!: string | null;

  @ManyToOne(() => PlatformStaff, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_staff_id' })
  assignedStaff!: PlatformStaff | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
