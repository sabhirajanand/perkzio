export interface CustomerListItemDto {
  id: string;
  phoneE164: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastStampAt: string | null;
}

export type RoleTone = 'accent' | 'neutral';

export type CustomerRow = CustomerListItemDto & {
  roleLabel?: string;
  roleTone?: RoleTone;
  lastActiveLabel?: string;
};

export interface CustomersListDto {
  total: number;
  limit: number;
  offset: number;
  customers: CustomerRow[];
}
