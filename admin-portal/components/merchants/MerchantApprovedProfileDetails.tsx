import type { ReactNode } from 'react';

import Card from '@/components/ui/card';
import type { MerchantDetailDto } from '@/lib/platform/platformServer';
import Link from 'next/link';

import MerchantRegistrationApplicationDetails from './MerchantRegistrationApplicationDetails';

function readStr(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v : null;
}

function formatDate(v: unknown): string {
  if (typeof v !== 'string') return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p>
      <div className="mt-1 text-sm font-semibold text-zinc-900">{children}</div>
    </div>
  );
}

function JsonPreview({ label, value }: { label: string; value: unknown }) {
  if (value == null) {
    return (
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p>
        <p className="mt-1 text-sm text-zinc-500">—</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p>
      <pre className="mt-2 max-h-56 overflow-auto rounded-xl bg-zinc-900/[0.04] p-3 text-xs leading-relaxed text-zinc-800">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export interface MerchantApprovedProfileDetailsProps {
  detail: MerchantDetailDto;
}

export default function MerchantApprovedProfileDetails({ detail }: MerchantApprovedProfileDetailsProps) {
  const m = detail.merchant;
  const addr = m.registeredAddress && typeof m.registeredAddress === 'object' ? (m.registeredAddress as Record<string, unknown>) : null;
  const b = detail.headBranch;

  return (
    <div className="space-y-4">
      <Card className="rounded-[32px] p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Merchant account</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Row label="Legal name">{m.legalName}</Row>
          <Row label="Trading name">{m.tradingName || '—'}</Row>
          <Row label="Status">{m.status}</Row>
          <Row label="KYC status">{m.kycStatus}</Row>
          <Row label="Primary email">{m.primaryBusinessEmail || '—'}</Row>
          <Row label="PAN (record)">{m.pan || '—'}</Row>
          <Row label="GSTIN (record)">{m.gstin || '—'}</Row>
          <Row label="Referral code">{m.referralCode || '—'}</Row>
          <Row label="Subscription limited mode">{m.subscriptionLimitedMode ? 'Yes' : 'No'}</Row>
          <Row label="Category (directory)">
            {m.category != null ? `${m.category.name} (${m.category.slug})` : '—'}
          </Row>
          <Row label="Created">{formatDate(m.createdAt)}</Row>
          <Row label="Updated">{formatDate(m.updatedAt)}</Row>
        </div>
      </Card>

      <Card className="rounded-[32px] p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Registered address (system record)</h2>
        {addr ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Row label="Address line 1">{readStr(addr.line1) || '—'}</Row>
            <Row label="City">{readStr(addr.city) || '—'}</Row>
            <Row label="State">{readStr(addr.state) || '—'}</Row>
            <Row label="PIN code">{readStr(addr.pinCode) || '—'}</Row>
            <div className="md:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Maps URL</p>
              {readStr(addr.mapsUrl) ? (
                <a
                  href={readStr(addr.mapsUrl)!}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block break-all text-sm font-semibold text-blue-700 hover:underline"
                >
                  {readStr(addr.mapsUrl)}
                </a>
              ) : (
                <p className="mt-1 text-sm text-zinc-500">—</p>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">No address on file.</p>
        )}
      </Card>

      {b ? (
        <Card className="rounded-[32px] p-6">
          <h2 className="text-sm font-semibold text-zinc-900">Head branch</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Row label="Branch ID">{readStr(b.id) || '—'}</Row>
            <Row label="Name">{readStr(b.name) || '—'}</Row>
            <Row label="Status">{readStr(b.status) || '—'}</Row>
            <Row label="Google Place ID">{readStr(b.googleMapsPlaceId) || '—'}</Row>
            <Row label="Latitude">{typeof b.latitude === 'number' ? String(b.latitude) : '—'}</Row>
            <Row label="Longitude">{typeof b.longitude === 'number' ? String(b.longitude) : '—'}</Row>
          </div>
          <div className="mt-6 space-y-4">
            <JsonPreview label="Branch address (JSON)" value={b.address} />
            <JsonPreview label="Social links (JSON)" value={b.socialLinks} />
            <JsonPreview label="Opening hours (JSON)" value={b.openingHours} />
          </div>
        </Card>
      ) : (
        <Card className="rounded-[32px] p-6">
          <h2 className="text-sm font-semibold text-zinc-900">Head branch</h2>
          <p className="mt-2 text-sm text-zinc-500">No head branch on file.</p>
        </Card>
      )}

      {detail.onboardingApplication ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Onboarding application</h2>
            {readStr(detail.onboardingApplication.id) ? (
              <Link
                href={`/merchants/registrations/${readStr(detail.onboardingApplication.id)}`}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-50"
              >
                Open in registrations
              </Link>
            ) : null}
          </div>
          <MerchantRegistrationApplicationDetails
            application={{ ...detail.onboardingApplication, merchant: detail.merchant }}
            showLegacyPayloadSections
            showLinkedMerchantRecord={false}
          />
        </div>
      ) : (
        <Card className="rounded-[32px] p-6">
          <h2 className="text-sm font-semibold text-zinc-900">Onboarding application</h2>
          <p className="mt-2 text-sm text-zinc-500">No onboarding application is linked to this merchant.</p>
        </Card>
      )}
    </div>
  );
}
