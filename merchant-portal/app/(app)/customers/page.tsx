import Link from 'next/link';

import Card from '@/components/ui/card';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';

interface CustomerListItemDto {
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

interface CustomersListDto {
  total: number;
  limit: number;
  offset: number;
  customers: CustomerListItemDto[];
}

async function getCustomers(q: string | null): Promise<CustomersListDto | null> {
  const url = new URL('http://local/api/merchant/customers');
  if (q) url.searchParams.set('q', q);
  const res = await fetch(url.pathname + url.search, { cache: 'no-store' }).catch(() => null);
  if (!res || !res.ok) return null;
  return (await res.json().catch(() => null)) as CustomersListDto | null;
}

function formatName(c: CustomerListItemDto) {
  const full = [c.firstName, c.lastName].filter(Boolean).join(' ');
  return full || '—';
}

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = typeof sp.q === 'string' && sp.q.trim() ? sp.q.trim() : null;
  const data = await getCustomers(q);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Customers</h1>
          <p className="mt-2 text-sm text-zinc-600">Search, filter and view your customer base.</p>
        </div>
      </div>

      <Card className="rounded-[32px] p-6">
        <form action="/customers" className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="q">Search</Label>
            <Input id="q" name="q" defaultValue={q ?? ''} placeholder="Phone, email, first name, last name" />
          </div>
          <button className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(241,30,105,0.40)] hover:brightness-95">
            Search
          </button>
        </form>
      </Card>

      <Card className="rounded-[32px] p-0">
        {!data ? (
          <div className="p-6">
            <p className="text-sm text-zinc-600">Unable to load customers.</p>
          </div>
        ) : data.customers.length === 0 ? (
          <div className="p-6">
            <p className="text-sm text-zinc-600">No customers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-black/5">
              <thead className="bg-white">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Last activity</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 bg-white">
                {data.customers.map((c) => (
                  <tr key={c.id} className="text-sm text-zinc-700">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-zinc-900">{formatName(c)}</p>
                      <p className="mt-1 text-xs text-zinc-500">{c.status}</p>
                    </td>
                    <td className="px-6 py-4">{c.phoneE164}</td>
                    <td className="px-6 py-4">{c.email ?? '—'}</td>
                    <td className="px-6 py-4">
                      {c.lastStampAt ? new Date(c.lastStampAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/customers/${c.id}`} className="text-sm font-semibold text-primary hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

