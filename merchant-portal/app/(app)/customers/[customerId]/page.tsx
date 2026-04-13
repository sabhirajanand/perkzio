import Card from '@/components/ui/card';

interface CustomerDetailDto {
  customer: {
    id: string;
    phoneE164: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  enrolments: Array<{
    id: string;
    enrolledAt: string;
    lastActivityAt: string | null;
    currentStampCount: number;
    loyaltyCardId: string;
    loyaltyCardName: string;
    loyaltyCardStatus: string;
  }>;
}

async function getCustomer(customerId: string): Promise<CustomerDetailDto | null> {
  const res = await fetch(`/api/merchant/customers/${customerId}`, { cache: 'no-store' }).catch(() => null);
  if (!res || !res.ok) return null;
  return (await res.json().catch(() => null)) as CustomerDetailDto | null;
}

function formatName(c: CustomerDetailDto['customer']) {
  const full = [c.firstName, c.lastName].filter(Boolean).join(' ');
  return full || '—';
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  const detail = await getCustomer(customerId);

  if (!detail) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">Customer not found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{formatName(detail.customer)}</h1>
        <p className="mt-2 text-sm text-zinc-600">{detail.customer.phoneE164}</p>
      </div>

      <Card className="rounded-[32px] p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Email</p>
            <p className="mt-1 text-sm text-zinc-700">{detail.customer.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Status</p>
            <p className="mt-1 text-sm text-zinc-700">{detail.customer.status}</p>
          </div>
        </div>
      </Card>

      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">Loyalty cards</p>
        {detail.enrolments.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">No enrolments yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-black/5">
            {detail.enrolments.map((e) => (
              <div key={e.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{e.loyaltyCardName}</p>
                  <p className="mt-1 text-sm text-zinc-600">{e.loyaltyCardStatus}</p>
                </div>
                <div className="text-sm text-zinc-700">
                  <p>
                    <span className="font-semibold text-zinc-900">{e.currentStampCount}</span> stamps
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Enrolled: {new Date(e.enrolledAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

