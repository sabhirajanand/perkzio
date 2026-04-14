'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import Card from '@/components/ui/card';
import Button from '@/components/ui/button';

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

  const shouldShow = useMemo(() => {
    if (!me || typeof me !== 'object' || !('merchant' in me)) return false;
    if (me.merchant.status !== 'ACTIVE') return false;
    const verifiedAt = me.user?.emailVerifiedAt ?? null;
    return !verifiedAt;
  }, [me]);

  if (!shouldShow) return null;

  return (
    <Card className="rounded-[32px] border border-primary/20 bg-[#FDF2F8] p-6 ring-1 ring-black/5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Verify your email</p>
          <p className="mt-1 text-sm text-zinc-600">Verify your email to secure your account and unlock all features.</p>
        </div>
        <Link href="/settings#verify-email">
          <Button>Verify email</Button>
        </Link>
      </div>
    </Card>
  );
}

