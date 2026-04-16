'use client';

import { Mail } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type MerchantMe =
  | {
      ok: true;
      merchant: { status: string };
      user?: { emailVerifiedAt?: string | null };
    }
  | { message?: string };

export default function EmailVerifyBanner() {
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

  const shouldShow = () => {
    if (!me || typeof me !== 'object' || !('merchant' in me)) return false;
    const verifiedAt = me.user?.emailVerifiedAt ?? null;
    return !verifiedAt;
  };

  if (!shouldShow) return null;

  return (
    <div className="flex items-center rounded-full border-l-4 border-primary-brand/20 bg-surface-container-low p-4">
      <Mail className="mr-3 h-6 w-6 shrink-0 text-primary-brand/60" strokeWidth={1.75} aria-hidden />
      <p className="text-sm text-on-surface-variant">
        Please{' '}
        <Link href="/settings#verify-email" className="text-primary-brand font-bold hover:underline">
          verify your email
        </Link>{' '}
        to enable full campaign features.
      </p>
    </div>
  );
}
