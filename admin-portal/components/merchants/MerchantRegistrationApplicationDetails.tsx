import type { ReactNode } from 'react';

import Card from '@/components/ui/card';
import { merchantApplicationStatusLabel } from '@/lib/merchantApplications/statusLabel';
import Link from 'next/link';

export interface MerchantRegistrationApplicationDetailsProps {
  application: Record<string, unknown>;
  /** Legacy KYC filenames/keys and full subscription plan metadata (merchant profile only) */
  showLegacyPayloadSections?: boolean;
  /** Hide when viewing from the merchant profile (same merchant is already the page subject) */
  showLinkedMerchantRecord?: boolean;
}

function readStr(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v : null;
}

function readNum(v: unknown): string | null {
  return typeof v === 'number' && Number.isFinite(v) ? String(v) : null;
}

function readPayloadField(payload: unknown, key: string): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const v = (payload as Record<string, unknown>)[key];
  return readStr(v);
}

function formatDate(v: unknown): string {
  if (typeof v !== 'string') return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

function DetailBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p>
      <div className="mt-1 text-sm font-semibold text-zinc-900">{children}</div>
    </div>
  );
}

function OptionalLink({ href }: { href: string }) {
  const trimmed = href.trim();
  const isHttp = /^https?:\/\//i.test(trimmed);
  if (isHttp) {
    return (
      <a href={trimmed} target="_blank" rel="noreferrer" className="break-all font-semibold text-blue-700 hover:underline">
        {trimmed}
      </a>
    );
  }
  return <span className="break-words">{trimmed}</span>;
}

function safeHttpImageUrl(v: unknown): string | null {
  const s = readStr(v);
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return s;
  } catch {
    return null;
  }
}

function RegistrationImagePreview({
  title,
  subtitle,
  fileName,
  imageUrl,
}: {
  title: string;
  subtitle: string;
  fileName: string | null;
  imageUrl: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-zinc-50/50 ring-1 ring-black/5">
      <div className="border-b border-black/5 bg-white px-4 py-3">
        <p className="text-sm font-semibold text-zinc-900">{title}</p>
        <p className="text-xs text-zinc-500">{subtitle}</p>
        {fileName ? <p className="mt-1 truncate text-xs font-medium text-zinc-600">{fileName}</p> : null}
      </div>
      <div className="relative flex min-h-[200px] items-center justify-center bg-zinc-100 p-3">
        {imageUrl ? (
          <a href={imageUrl} target="_blank" rel="noreferrer" className="block max-h-[320px] w-full max-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase/public URLs; avoids image domain config */}
            <img
              src={imageUrl}
              alt=""
              className="mx-auto max-h-[320px] w-auto max-w-full rounded-lg object-contain shadow-sm"
            />
          </a>
        ) : (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">No image URL on file</p>
        )}
      </div>
    </div>
  );
}

export default function MerchantRegistrationApplicationDetails({
  application,
  showLegacyPayloadSections = false,
  showLinkedMerchantRecord = true,
}: MerchantRegistrationApplicationDetailsProps) {
  const statusRaw = typeof application.status === 'string' ? application.status : '—';
  const payload = application.businessPayload;
  const selectedPlan = application.selectedPlan;
  const merchant = application.merchant;
  const reviewer = application.reviewedByStaff;

  const planObj = selectedPlan && typeof selectedPlan === 'object' ? (selectedPlan as Record<string, unknown>) : null;
  const merchantObj = merchant && typeof merchant === 'object' ? (merchant as Record<string, unknown>) : null;
  const reviewerObj = reviewer && typeof reviewer === 'object' ? (reviewer as Record<string, unknown>) : null;

  return (
    <div className="space-y-4">
      <Card className="rounded-[32px] p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Application</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <DetailBlock label="Status">{merchantApplicationStatusLabel(statusRaw)}</DetailBlock>
          <DetailBlock label="Submitted">{formatDate(application.createdAt)}</DetailBlock>
          <DetailBlock label="Last updated">{formatDate(application.updatedAt)}</DetailBlock>
          <DetailBlock label="Reviewed at">{application.reviewedAt ? formatDate(application.reviewedAt) : '—'}</DetailBlock>
          <DetailBlock label="Reviewed by">
            {reviewerObj
              ? readStr(reviewerObj.fullName) || readStr(reviewerObj.email) || readStr(reviewerObj.id) || '—'
              : '—'}
          </DetailBlock>
          <DetailBlock label="Razorpay order ID">{readStr(application.razorpayOrderId) || '—'}</DetailBlock>
        </div>
      </Card>

      {showLegacyPayloadSections && planObj ? (
        <Card className="rounded-[32px] p-6">
          <h2 className="text-sm font-semibold text-zinc-900">Subscription plan (catalog)</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DetailBlock label="Plan code">{readStr(planObj.code) || '—'}</DetailBlock>
            <DetailBlock label="Plan name">{readStr(planObj.name) || '—'}</DetailBlock>
            <DetailBlock label="Analytics tier">{readStr(planObj.analyticsTier) || '—'}</DetailBlock>
            <DetailBlock label="Support SLA tier">{readStr(planObj.supportSlaTier) || '—'}</DetailBlock>
            <DetailBlock label="Max loyalty cards">{readNum(planObj.maxLoyaltyCards) || '—'}</DetailBlock>
            <DetailBlock label="Max active customers">{readNum(planObj.maxActiveCustomers) || '—'}</DetailBlock>
          </div>
        </Card>
      ) : null}

      <Card className="rounded-[32px] p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Business & primary contact</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <DetailBlock label="Business name">{readPayloadField(payload, 'businessName') || '—'}</DetailBlock>
          <DetailBlock label="Category">{readPayloadField(payload, 'category') || '—'}</DetailBlock>
          <DetailBlock label="Contact name">{readPayloadField(payload, 'contactName') || '—'}</DetailBlock>
          <DetailBlock label="Contact email">{readPayloadField(payload, 'contactEmail') || '—'}</DetailBlock>
          <DetailBlock label="Contact phone">{readPayloadField(payload, 'contactPhone') || '—'}</DetailBlock>
        </div>
      </Card>

      <Card className="rounded-[32px] p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Logo & shop photos</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Images from registration (public URLs). Click an image to open it in a new tab.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <RegistrationImagePreview
            title="Logo"
            subtitle="Brand mark for the portal and customer-facing pages."
            fileName={readPayloadField(payload, 'logoFileName')}
            imageUrl={safeHttpImageUrl(readPayloadField(payload, 'logoUrl'))}
          />
          <RegistrationImagePreview
            title="Inside view"
            subtitle="Interior of the outlet (working area and setup)."
            fileName={readPayloadField(payload, 'insideViewFileName')}
            imageUrl={safeHttpImageUrl(readPayloadField(payload, 'insideViewUrl'))}
          />
          <RegistrationImagePreview
            title="Outside view"
            subtitle="Exterior of the shop (storefront / premises)."
            fileName={readPayloadField(payload, 'outsideViewFileName')}
            imageUrl={safeHttpImageUrl(readPayloadField(payload, 'outsideViewUrl'))}
          />
        </div>
      </Card>

      <Card className="rounded-[32px] p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Registered address</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <DetailBlock label="Address line 1">{readPayloadField(payload, 'addressLine1') || '—'}</DetailBlock>
          <DetailBlock label="City">{readPayloadField(payload, 'city') || '—'}</DetailBlock>
          <DetailBlock label="State">{readPayloadField(payload, 'state') || '—'}</DetailBlock>
          <DetailBlock label="PIN code">{readPayloadField(payload, 'pinCode') || '—'}</DetailBlock>
          <div className="md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Google Maps</p>
            <div className="mt-1 text-sm">
              {readPayloadField(payload, 'mapsUrl') ? <OptionalLink href={readPayloadField(payload, 'mapsUrl')!} /> : '—'}
            </div>
          </div>
        </div>
      </Card>

      <Card className="rounded-[32px] p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Plan & scale</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <DetailBlock label="Requested plan">{readPayloadField(payload, 'plan') || '—'}</DetailBlock>
          {planObj && !showLegacyPayloadSections ? <DetailBlock label="Plan (catalog)">{readStr(planObj.name) || '—'}</DetailBlock> : null}
          <DetailBlock label="Billing cycle">{readPayloadField(payload, 'billingCycle') || '—'}</DetailBlock>
          <DetailBlock label="Outlets (declared)">
            {!payload || typeof payload !== 'object'
              ? '—'
              : readNum((payload as Record<string, unknown>).outletsCount) || '—'}
          </DetailBlock>
        </div>
      </Card>

      <Card className="rounded-[32px] p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Tax identifiers</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <DetailBlock label="PAN">{readPayloadField(payload, 'pan') || '—'}</DetailBlock>
          <DetailBlock label="GSTIN">{readPayloadField(payload, 'gstin') || '—'}</DetailBlock>
        </div>
      </Card>

      <Card className="rounded-[32px] p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Online presence</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Website</p>
            <div className="mt-1 text-sm">
              {readPayloadField(payload, 'website') ? <OptionalLink href={readPayloadField(payload, 'website')!} /> : '—'}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Google Business profile</p>
            <div className="mt-1 text-sm">
              {readPayloadField(payload, 'googleBusinessUrl') ? (
                <OptionalLink href={readPayloadField(payload, 'googleBusinessUrl')!} />
              ) : (
                '—'
              )}
            </div>
          </div>
          <DetailBlock label="Instagram">{readPayloadField(payload, 'instagram') || '—'}</DetailBlock>
          <DetailBlock label="Facebook">{readPayloadField(payload, 'facebook') || '—'}</DetailBlock>
        </div>
      </Card>

      {showLegacyPayloadSections ? (
        <Card className="rounded-[32px] p-6">
          <h2 className="text-sm font-semibold text-zinc-900">Documents (as submitted)</h2>
          <p className="mt-1 text-xs text-zinc-500">Legacy registration uploads, if any.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {(
              [
                ['GST certificate file', 'gstCertFileName'],
                ['PAN card file', 'panCardFileName'],
                ['Address proof file', 'addressProofFileName'],
                ['Shop photo file', 'shopPhotoFileName'],
              ] as const
            ).map(([label, key]) => (
              <DetailBlock key={key} label={label}>
                {readPayloadField(payload, key) || '—'}
              </DetailBlock>
            ))}
            {(
              [
                ['GST upload key', 'gstCertUploadKey'],
                ['PAN upload key', 'panCardUploadKey'],
                ['Address proof upload key', 'addressProofUploadKey'],
                ['Shop photo upload key', 'shopPhotoUploadKey'],
              ] as const
            ).map(([label, key]) => (
              <div key={key} className="md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p>
                <p className="mt-1 break-all font-mono text-xs font-semibold text-zinc-800">{readPayloadField(payload, key) || '—'}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {showLinkedMerchantRecord && merchantObj && readStr(merchantObj.id) ? (
        <Card className="rounded-[32px] p-6">
          <h2 className="text-sm font-semibold text-zinc-900">Linked merchant record</h2>
          <p className="mt-1 text-xs text-zinc-500">System record created when this application was submitted (may mirror the form answers).</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DetailBlock label="Merchant ID">
              <Link className="text-blue-700 hover:underline" href={`/merchants/${readStr(merchantObj.id)}`}>
                {readStr(merchantObj.id)}
              </Link>
            </DetailBlock>
            <DetailBlock label="Legal name">{readStr(merchantObj.legalName) || '—'}</DetailBlock>
            <DetailBlock label="Account status">{readStr(merchantObj.status) || '—'}</DetailBlock>
            <DetailBlock label="KYC status">{readStr(merchantObj.kycStatus) || '—'}</DetailBlock>
            <DetailBlock label="Primary email">{readStr(merchantObj.primaryBusinessEmail) || '—'}</DetailBlock>
            <DetailBlock label="Limited subscription mode">{merchantObj.subscriptionLimitedMode === true ? 'Yes' : merchantObj.subscriptionLimitedMode === false ? 'No' : '—'}</DetailBlock>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
