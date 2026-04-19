import type { CustomerRow, CustomersListDto } from '@/components/customers/types';

export const MOCK_CUSTOMERS_TOTAL = 248;

const TEMPLATES: Array<Omit<CustomerRow, 'id'>> = [
  {
    phoneE164: '+91 98765 43210',
    email: 'helena.e@architect.com',
    firstName: 'Helena',
    lastName: 'Echeverria',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastStampAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    lastActiveLabel: '2 mins ago',
    roleLabel: 'Lead Interiorist',
    roleTone: 'accent',
  },
  {
    phoneE164: '+91 98102 33445',
    email: 'm.thorne@architect.com',
    firstName: 'Marcus',
    lastName: 'Thorne',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastStampAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    lastActiveLabel: '45 mins ago',
    roleLabel: 'BIM Manager',
    roleTone: 'neutral',
  },
  {
    phoneE164: '+91 99887 76655',
    email: 'sofia.k@architect.com',
    firstName: 'Sofia',
    lastName: 'Kumar',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastStampAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    roleLabel: 'Project Lead',
    roleTone: 'accent',
  },
  {
    phoneE164: '+91 91234 55667',
    email: 'james.r@architect.com',
    firstName: 'James',
    lastName: 'Rivera',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastStampAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    roleLabel: 'Site Coordinator',
    roleTone: 'neutral',
  },
  {
    phoneE164: '+91 90011 22334',
    email: 'priya.m@architect.com',
    firstName: 'Priya',
    lastName: 'Menon',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastStampAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    roleLabel: 'Studio Director',
    roleTone: 'accent',
  },
  {
    phoneE164: '+91 97654 32109',
    email: 'daniel.w@architect.com',
    firstName: 'Daniel',
    lastName: 'Wu',
    status: 'INACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastStampAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    roleLabel: 'Visualiser',
    roleTone: 'neutral',
  },
  {
    phoneE164: '+91 94567 88990',
    email: 'anya.p@architect.com',
    firstName: 'Anya',
    lastName: 'Patel',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastStampAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    lastActiveLabel: '1 hour ago',
    roleLabel: 'Store Manager',
    roleTone: 'neutral',
  },
  {
    phoneE164: '+91 92345 77889',
    email: 'oliver.t@architect.com',
    firstName: 'Oliver',
    lastName: 'Thomas',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastStampAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    roleLabel: 'Consultant',
    roleTone: 'accent',
  },
  {
    phoneE164: '+91 93456 11223',
    email: 'elena.v@architect.com',
    firstName: 'Elena',
    lastName: 'Vasquez',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastStampAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    lastActiveLabel: '20 mins ago',
    roleLabel: 'Design Lead',
    roleTone: 'accent',
  },
  {
    phoneE164: '+91 95678 99001',
    email: 'noah.b@architect.com',
    firstName: 'Noah',
    lastName: 'Bennett',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastStampAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    roleLabel: 'Estimator',
    roleTone: 'neutral',
  },
  {
    phoneE164: '+91 96789 00112',
    email: 'mei.l@architect.com',
    firstName: 'Mei',
    lastName: 'Lin',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastStampAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    roleLabel: 'Architect',
    roleTone: 'accent',
  },
];

function templateAt(index: number): Omit<CustomerRow, 'id'> {
  const base = TEMPLATES[index % TEMPLATES.length];
  const cycle = Math.floor(index / TEMPLATES.length);
  if (cycle === 0) return { ...base };
  return {
    ...base,
    lastName: base.lastName ? `${base.lastName} (${cycle + 1})` : null,
    email: base.email?.replace('@', `+${cycle}@`) ?? null,
  };
}

export function buildMockCustomersListDto(page: number, pageSize: number): CustomersListDto {
  const offset = (page - 1) * pageSize;
  const remaining = Math.max(0, MOCK_CUSTOMERS_TOTAL - offset);
  const count = Math.min(pageSize, remaining);
  const customers: CustomerRow[] = [];

  for (let i = 0; i < count; i += 1) {
    const globalIndex = offset + i;
    const t = templateAt(globalIndex);
    customers.push({
      ...t,
      id: `mock-${globalIndex}`,
    });
  }

  return {
    total: MOCK_CUSTOMERS_TOTAL,
    limit: pageSize,
    offset,
    customers,
  };
}

export function shouldUseMockCustomers(data: CustomersListDto | null, q: string | null): boolean {
  if (!data) return false;
  if (q && q.trim().length > 0) return false;
  return data.total === 0 && data.customers.length === 0;
}
