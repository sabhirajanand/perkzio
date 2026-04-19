'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BadgeCheck } from 'lucide-react';

import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';

type MerchantMe =
  | {
      ok: true;
      merchant: {
        status: string;
        kycStatus: string;
        subscriptionLimitedMode: boolean;
        primaryBusinessEmail: string | null;
      };
      user: { email: string; emailVerifiedAt: string | null; role: string };
    }
  | { message?: string };

export default function ProfileSettings() {
  const [me, setMe] = useState<MerchantMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [challengeId, setChallengeId] = useState<string>('');
  const [code, setCode] = useState('');

  const status = useMemo(() => {
    if (!me || typeof me !== 'object' || !('merchant' in me)) return null;
    return me.merchant.status;
  }, [me]);
  void status;

  const emailVerified = useMemo(() => {
    if (!me || typeof me !== 'object' || !('user' in me)) return false;
    return Boolean(me.user.emailVerifiedAt);
  }, [me]);

  const showVerifyEmailSection = useMemo(() => {
    if (loading) return false;
    if (!me || typeof me !== 'object' || !('user' in me)) return false;
    return !me.user.emailVerifiedAt;
  }, [loading, me]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/merchant/me')
      .then(async (r) => (r.ok ? ((await r.json().catch(() => null)) as MerchantMe | null) : null))
      .then((json) => {
        if (cancelled) return;
        setMe(json);
      })
      .catch(() => {
        if (!cancelled) setMe(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function sendVerification() {
    setSending(true);
    try {
      const res = await fetch('/api/merchant/email/verification/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'EMAIL_VERIFICATION' }),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; challengeId?: string; debugCode?: string; message?: string }
        | null;
      if (!res.ok) throw new Error(body?.message || 'Unable to send verification code');
      if (body?.challengeId) setChallengeId(String(body.challengeId));
      toast.success('Verification code sent. Please check your inbox.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to send verification');
    } finally {
      setSending(false);
    }
  }

  async function verifyEmail() {
    if (!challengeId) {
      toast.error('Please request a verification code first.');
      return;
    }
    if (!code.trim()) {
      toast.error('Enter the verification code.');
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch('/api/merchant/email/verification/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'EMAIL_VERIFICATION', challengeId, code: code.trim() }),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      if (!res.ok) throw new Error(body?.message || 'Unable to verify email');
      toast.success('Email verified.');
      window.location.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to verify email');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Profile &amp; settings</h1>
        <p className="mt-2 text-sm text-zinc-600">Manage your profile and security settings.</p>
      </div>

      <Card className="rounded-[32px] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Business email</p>
              {emailVerified ? <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden /> : null}
            </div>
            <p className="mt-1 text-sm font-semibold text-zinc-900">
              {me && typeof me === 'object' && 'merchant' in me ? me.merchant.primaryBusinessEmail || '—' : loading ? 'Loading…' : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Account status</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">
              {me && typeof me === 'object' && 'merchant' in me ? me.merchant.status : loading ? 'Loading…' : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">KYC status</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">
              {me && typeof me === 'object' && 'merchant' in me ? me.merchant.kycStatus : loading ? 'Loading…' : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Limited mode</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">
              {me && typeof me === 'object' && 'merchant' in me ? (me.merchant.subscriptionLimitedMode ? 'Yes' : 'No') : loading ? 'Loading…' : '—'}
            </p>
          </div>
        </div>
      </Card>

      {showVerifyEmailSection ? (
        <Card id="verify-email" className="rounded-[32px] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Verify email</h2>
            <p className="mt-1 text-sm text-zinc-600">Verify your email to secure your account.</p>
          </div>
            <Button onClick={sendVerification} disabled={sending || verifying}>
              {sending ? 'Sending…' : 'Send code'}
            </Button>
        </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Verification code</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
                inputMode="numeric"
                className="mt-2"
              />
            </div>
            <Button onClick={verifyEmail} disabled={verifying || sending}>
              {verifying ? 'Verifying…' : 'Verify'}
            </Button>
          </div>
      </Card>
      ) : null}
    </div>
  );
}

