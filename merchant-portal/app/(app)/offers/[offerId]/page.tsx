import Link from 'next/link';

import Button from '@/components/ui/button';
import Card from '@/components/ui/card';

interface OfferDetailDto {
  offer: {
    id: string;
    title: string;
    description: string | null;
    termsHtml: string | null;
    imageS3Key: string | null;
    validFrom: string;
    validTo: string;
    audienceType: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  branchIds: string[];
}

async function getOffer(offerId: string): Promise<OfferDetailDto | null> {
  const res = await fetch(`/api/merchant/offers/${offerId}`, { cache: 'no-store' }).catch(() => null);
  if (!res || !res.ok) return null;
  return (await res.json().catch(() => null)) as OfferDetailDto | null;
}

export default async function OfferDetailPage({ params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;
  const detail = await getOffer(offerId);

  if (!detail) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">Offer not found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{detail.offer.title}</h1>
          <p className="mt-2 text-sm text-zinc-600">{detail.offer.status}</p>
        </div>
        <Link href={`/offers/${offerId}/edit`}>
          <Button variant="outline">Edit</Button>
        </Link>
      </div>

      <Card className="rounded-[32px] p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Valid</p>
            <p className="mt-1 text-sm text-zinc-700">
              {new Date(detail.offer.validFrom).toLocaleString()} → {new Date(detail.offer.validTo).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Audience</p>
            <p className="mt-1 text-sm text-zinc-700">{detail.offer.audienceType}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Description</p>
            <p className="mt-1 text-sm text-zinc-700">{detail.offer.description ?? '—'}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Branch scope</p>
            <p className="mt-1 text-sm text-zinc-700">
              {detail.branchIds.length ? `${detail.branchIds.length} branch(es)` : 'All branches (not scoped)'}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold text-zinc-900">Terms & conditions</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">{detail.offer.termsHtml ?? '—'}</p>
        </div>
      </Card>
    </div>
  );
}

