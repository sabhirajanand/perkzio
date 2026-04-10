import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'special_offer_branch_scope' })
export class SpecialOfferBranchScope {
  @PrimaryColumn('uuid', { name: 'offer_id' })
  offerId!: string;

  @PrimaryColumn('uuid', { name: 'branch_id' })
  branchId!: string;
}
