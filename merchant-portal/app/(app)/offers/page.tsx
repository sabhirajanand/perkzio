import Link from 'next/link';

import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';

interface OfferListItemDto {
  id: string;
  title: string;
  status: string;
  validFrom: string;
  validTo: string;
  audienceType: string;
  createdAt: string;
  updatedAt: string;
  redemptionCount: number;
}

interface OffersListDto {
  total: number;
  limit: number;
  offset: number;
  offers: OfferListItemDto[];
}

async function getOffers(input: { q: string | null; status: string | null }): Promise<OffersListDto | null> {
  const url = new URL('http://local/api/merchant/offers');
  if (input.q) url.searchParams.set('q', input.q);
  if (input.status) url.searchParams.set('status', input.status);
  const res = await fetch(url.pathname + url.search, { cache: 'no-store' }).catch(() => null);
  if (!res || !res.ok) return null;
  return (await res.json().catch(() => null)) as OffersListDto | null;
}

function statusPill(status: string) {
  const base = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold';
  if (status === 'ACTIVE') return `${base} bg-green-50 text-green-700`;
  if (status === 'PAUSED') return `${base} bg-amber-50 text-amber-700`;
  return `${base} bg-zinc-100 text-zinc-700`;
}

export default async function OffersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const sp = await searchParams;
  const q = typeof sp.q === 'string' && sp.q.trim() ? sp.q.trim() : null;
  const status = typeof sp.status === 'string' && sp.status.trim() ? sp.status.trim() : null;
  const data = await getOffers({ q, status });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Offers</h1>
          <p className="mt-2 text-sm text-zinc-600">Create and manage special offers.</p>
        </div>
        <Link href="/offers/new">
          <Button>Create offer</Button>
        </Link>
      </div>

      <Card className="rounded-[32px] p-6">
        <form action="/offers" className="grid gap-4 md:grid-cols-3 md:items-end">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="q">Search</Label>
            <Input id="q" name="q" defaultValue={q ?? ''} placeholder="Offer title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={status ?? ''}
              className="h-[55px] w-full rounded-full bg-[#F3F4F6] px-6 text-base text-zinc-900 outline-none focus:bg-zinc-50 focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <button className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(241,30,105,0.40)] hover:brightness-95">
              Apply filters
            </button>
          </div>
        </form>
      </Card>

      <Card className="rounded-[32px] p-0">
        {!data ? (
          <div className="p-6">
            <p className="text-sm text-zinc-600">Unable to load offers.</p>
          </div>
        ) : data.offers.length === 0 ? (
          <div className="p-6">
            <p className="text-sm text-zinc-600">No offers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-black/5">
              <thead className="bg-white">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <th className="px-6 py-4">Offer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Valid</th>
                  <th className="px-6 py-4">Redemptions</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 bg-white">
                {data.offers.map((o) => (
                  <tr key={o.id} className="text-sm text-zinc-700">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-zinc-900">{o.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">{o.audienceType}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={statusPill(o.status)}>{o.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-zinc-900">
                        {new Date(o.validFrom).toLocaleDateString()} → {new Date(o.validTo).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">{o.redemptionCount}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/offers/${o.id}`} className="text-sm font-semibold text-primary hover:underline">
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

