import Card from '@/components/ui/card';
import OfferForm from '@/components/offers/OfferForm';

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
    status: 'DRAFT' | 'ACTIVE' | 'PAUSED';
    createdAt: string;
    updatedAt: string;
  };
  branchIds: string[];
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function getOffer(offerId: string): Promise<OfferDetailDto | null> {
  const res = await fetch(`/api/merchant/offers/${offerId}`, { cache: 'no-store' }).catch(() => null);
  if (!res || !res.ok) return null;
  return (await res.json().catch(() => null)) as OfferDetailDto | null;
}

export default async function EditOfferPage({ params }: { params: Promise<{ offerId: string }> }) {
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Edit offer</h1>
        <p className="mt-2 text-sm text-zinc-600">Update offer details and status.</p>
      </div>

      <Card className="rounded-[32px] p-6">
        <OfferForm
          mode="edit"
          offerId={offerId}
          initial={{
            title: detail.offer.title,
            description: detail.offer.description ?? '',
            termsHtml: detail.offer.termsHtml ?? '',
            validFrom: toLocalInputValue(detail.offer.validFrom),
            validTo: toLocalInputValue(detail.offer.validTo),
            audienceType: detail.offer.audienceType,
            status: detail.offer.status,
          }}
        />
      </Card>
    </div>
  );
}

