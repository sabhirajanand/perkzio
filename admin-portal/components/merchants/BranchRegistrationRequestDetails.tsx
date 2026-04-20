import type { ReactNode } from 'react';
import { Globe, MapPin } from 'lucide-react';

import BranchRegistrationOutletPreview from '@/components/merchants/BranchRegistrationOutletPreview';
import Card from '@/components/ui/card';

function readStr(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v : null;
}

function readObj(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
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

function AddressLines({ value }: { value: unknown }) {
  const a = readObj(value);
  if (!a) return <span className="text-zinc-500">—</span>;
  const line1 = readStr(a.line1) ?? readStr(a.addressLine1);
  const city = readStr(a.city);
  const state = readStr(a.state);
  const pinCode = readStr(a.pinCode);
  const mapsUrl = readStr(a.mapsUrl);
  const parts = [line1, [city, state].filter(Boolean).join(', '), pinCode].filter(Boolean);
  return (
    <div className="space-y-1">
      <div>{parts.length ? parts.join(' · ') : '—'}</div>
      {mapsUrl ? (
        <a className="text-xs font-semibold text-primary hover:underline" href={mapsUrl} target="_blank" rel="noreferrer">
          Open in Google Maps
        </a>
      ) : null}
    </div>
  );
}

function hrefOrWithProtocol(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url.replace(/^\/+/, '')}`;
}

function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
}

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

function SocialLinks({ payload }: { payload: Record<string, unknown> | null }) {
  if (!payload) return <span className="text-zinc-500">—</span>;
  const website = readStr(payload.website);
  const instagram = readStr(payload.instagram);
  const facebook = readStr(payload.facebook);
  const googleBusinessUrl = readStr(payload.googleBusinessUrl);
  const items: Array<{
    key: string;
    label: string;
    url: string;
    icon: ReactNode;
    iconWrapClass: string;
  }> = [];
  if (website) {
    items.push({
      key: 'website',
      label: 'Website',
      url: hrefOrWithProtocol(website),
      icon: <Globe className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />,
      iconWrapClass: 'bg-zinc-100 text-zinc-800 ring-1 ring-black/5',
    });
  }
  if (instagram) {
    items.push({
      key: 'instagram',
      label: 'Instagram',
      url: hrefOrWithProtocol(instagram),
      icon: <InstagramGlyph className="h-[18px] w-[18px]" />,
      iconWrapClass: 'bg-gradient-to-br from-[#F58529]/15 via-[#DD2A7B]/15 to-[#8134AF]/15 text-[#C13584] ring-1 ring-[#DD2A7B]/20',
    });
  }
  if (facebook) {
    items.push({
      key: 'facebook',
      label: 'Facebook',
      url: hrefOrWithProtocol(facebook),
      icon: <FacebookGlyph className="h-[18px] w-[18px]" />,
      iconWrapClass: 'bg-[#1877F2]/10 text-[#1877F2] ring-1 ring-[#1877F2]/20',
    });
  }
  if (googleBusinessUrl) {
    items.push({
      key: 'google',
      label: 'Google Business',
      url: hrefOrWithProtocol(googleBusinessUrl),
      icon: <MapPin className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />,
      iconWrapClass: 'bg-[#34A853]/10 text-[#1A73E8] ring-1 ring-[#34A853]/25',
    });
  }
  if (items.length === 0) return <span className="text-zinc-500">—</span>;
  return (
    <div className="flex flex-col gap-2">
      {items.map((i) => (
        <a
          key={i.key}
          href={i.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-3 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-black/[0.04] transition hover:border-black/10 hover:bg-zinc-50"
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${i.iconWrapClass}`}
            aria-hidden
          >
            {i.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500">{i.label}</span>
            <span className="mt-0.5 block truncate text-sm font-semibold text-primary">{i.url}</span>
          </span>
        </a>
      ))}
    </div>
  );
}

export interface BranchRegistrationRequestDetailsProps {
  detail: Record<string, unknown>;
}

export default function BranchRegistrationRequestDetails({ detail }: BranchRegistrationRequestDetailsProps) {
  const request = readObj(detail.request);
  const merchant = request ? readObj(request.merchant) : null;
  const payload = request ? readObj(request.payload) : null;
  const headBranch = readObj(detail.headBranch);
  const onboarding = readObj(detail.onboardingApplication);
  const onboardingPayload = onboarding ? readObj(onboarding.businessPayload) : null;

  const ownerName = onboardingPayload ? readStr(onboardingPayload.contactName) : null;
  const ownerPhone = onboardingPayload ? readStr(onboardingPayload.contactPhone) : null;

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Merchant details</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <DetailBlock label="Admin merchant">{merchant ? (readStr(merchant.legalName) ?? '—') : '—'}</DetailBlock>
          <DetailBlock label="Email">{merchant ? (readStr(merchant.primaryBusinessEmail) ?? '—') : '—'}</DetailBlock>
          <DetailBlock label="Branch admin">{ownerName ?? '—'}</DetailBlock>
          <DetailBlock label="Contact">{ownerPhone ?? '—'}</DetailBlock>
          <DetailBlock label="Head branch address">
            <AddressLines value={headBranch ? headBranch.address : null} />
          </DetailBlock>
        </div>
      </Card>

      <Card className="rounded-[32px] p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Branch request details</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <DetailBlock label="Branch name">{request ? (readStr(request.branchName) ?? '—') : '—'}</DetailBlock>
          <DetailBlock label="Status">{request ? (readStr(request.status) ?? '—') : '—'}</DetailBlock>
          <DetailBlock label="Submitted">{request ? formatDate(request.createdAt) : '—'}</DetailBlock>
          <DetailBlock label="Reviewed">{request ? (request.reviewedAt ? formatDate(request.reviewedAt) : '—') : '—'}</DetailBlock>
          <DetailBlock label="Branch admin">{request ? [readStr(request.adminName), readStr(request.adminEmail)].filter(Boolean).join(' · ') || '—' : '—'}</DetailBlock>
          <DetailBlock label="Branch admin phone">{request ? (readStr(request.adminPhone) ?? '—') : '—'}</DetailBlock>
          <DetailBlock label="Branch address">
            <AddressLines value={payload} />
          </DetailBlock>
          <BranchRegistrationOutletPreview payload={payload} />
          <DetailBlock label="Digital presence">
            <SocialLinks payload={payload} />
          </DetailBlock>
        </div>
      </Card>
    </div>
  );
}

