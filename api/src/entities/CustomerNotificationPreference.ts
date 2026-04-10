import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'customer_notification_preferences' })
export class CustomerNotificationPreference {
  @PrimaryColumn('uuid', { name: 'customer_id' })
  customerId!: string;

  @PrimaryColumn('uuid', { name: 'merchant_id' })
  merchantId!: string;

  @Column({ name: 'push_enabled', type: 'boolean', default: true })
  pushEnabled!: boolean;
}
