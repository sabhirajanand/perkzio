import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'special_offer_target_customers' })
export class SpecialOfferTargetCustomer {
  @PrimaryColumn('uuid', { name: 'offer_id' })
  offerId!: string;

  @PrimaryColumn('uuid', { name: 'customer_id' })
  customerId!: string;
}
