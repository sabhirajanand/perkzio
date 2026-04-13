import Card from '@/components/ui/card';
import MerchantApplicationActions from '@/components/merchants/MerchantApplicationActions';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { getMerchantApplication } from '@/lib/platform/platformServer';
import { readServerSession } from '@/lib/session/readServerSession';

function readField(payload: unknown, key: string): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const v = (payload as Record<string, unknown>)[key];
  return typeof v === 'string' && v.trim().length > 0 ? v : null;
}

export default async function MerchantRegistrationDetailPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;
  const session = await readServerSession();
  const canView = hasPermission(session, AdminPermissions.MERCHANT_APPLICATIONS_VIEW);
  const canReview = hasPermission(session, AdminPermissions.MERCHANT_APPLICATIONS_REVIEW);

  if (!canView) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">You do not have permission to view this application.</p>
      </Card>
    );
  }

  const json = await getMerchantApplication(applicationId);
  const application =
    json && typeof json === 'object' && 'application' in (json as object) ? (json as { application?: unknown }).application : null;

  if (!application || typeof application !== 'object') {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">Application not found</p>
      </Card>
    );
  }

  const a = application as Record<string, unknown>;
  const status = typeof a.status === 'string' ? a.status : '—';
  const referenceNumber = typeof a.referenceNumber === 'string' ? a.referenceNumber : '—';
  const payload = a.businessPayload;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Registration request</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Reference <span className="font-semibold text-zinc-900">{referenceNumber}</span> · Status{' '}
            <span className="font-semibold text-zinc-900">{status}</span>
          </p>
        </div>
        {status === 'SUBMITTED' ? <MerchantApplicationActions applicationId={applicationId} disabled={!canReview} /> : null}
      </div>

      <Card className="rounded-[32px] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Business name</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{readField(payload, 'businessName') || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Category</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{readField(payload, 'category') || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Contact name</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{readField(payload, 'contactName') || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Contact email</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{readField(payload, 'contactEmail') || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Contact phone</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{readField(payload, 'contactPhone') || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Plan</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{readField(payload, 'plan') || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">PAN</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{readField(payload, 'pan') || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">GSTIN</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{readField(payload, 'gstin') || '—'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

