import Card from '@/components/ui/card';
import OfferForm from '@/components/offers/OfferForm';

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NewOfferPage() {
  const now = new Date();
  const in7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Create offer</h1>
        <p className="mt-2 text-sm text-zinc-600">Set up your offer and publish when ready.</p>
      </div>

      <Card className="rounded-[32px] p-6">
        <OfferForm
          mode="create"
          initial={{
            title: '',
            description: '',
            termsHtml: '',
            validFrom: toLocalInputValue(now),
            validTo: toLocalInputValue(in7d),
            audienceType: 'ALL',
            status: 'DRAFT',
          }}
        />
      </Card>
    </div>
  );
}

