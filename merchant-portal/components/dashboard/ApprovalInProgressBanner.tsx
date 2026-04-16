'use client';

import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type MerchantMe =
  | {
      ok: true;
      merchant: { status: string };
    }
  | { message?: string };

export default function ApprovalInProgressBanner() {
  const [me, setMe] = useState<MerchantMe | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/merchant/me', { method: 'GET' })
      .then(async (r) => (r.ok ? ((await r.json().catch(() => null)) as MerchantMe | null) : null))
      .then((json) => {
        if (!cancelled) setMe(json);
      })
      .catch(() => {
        if (!cancelled) setMe(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const merchantStatus = () => {
    if (!me || typeof me !== 'object' || !('merchant' in me)) return null;
    const status = (me as { merchant?: { status?: unknown } }).merchant?.status;
    return typeof status === 'string' ? status : null;
  };

  const shouldShow = merchantStatus !== null;

  if (!shouldShow) return null;

  return (
    <div className="relative flex flex-col items-stretch justify-between gap-4 overflow-hidden rounded-lg bg-on-primary-container p-6 text-on-primary shadow-2xl shadow-primary-brand/10 sm:flex-row sm:items-center ">
      <div className="relative z-10 flex flex-1 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10">
          <ShieldCheck className="h-7 w-7 text-primary-container" strokeWidth={1.75} aria-hidden />
        </div>
        <div>
          <h3 className="font-headline text-lg font-bold">Your account approval is in progress</h3>
          <p className="mt-1 text-sm text-on-primary/70">
            Our team is reviewing your documents. Expected completion in 24 hours.
          </p>
        </div>
      </div>
      <Link
        href="/settings"
        className="font-headline relative z-10 shrink-0 rounded-full bg-white px-6 py-2 text-center text-sm font-bold text-on-primary-container transition-colors hover:bg-primary-container hover:text-white"
      >
        View Status
      </Link>
      <div className="pointer-events-none absolute right-0 top-0 h-full w-64 bg-gradient-to-l rounded-lg from-primary-brand/20 to-transparent" />
    </div>
  );
}
