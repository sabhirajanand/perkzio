'use client';

import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import type { RegisterApplicationInput } from '@/lib/schemas/register';

interface OtpSendResponse {
  ok: boolean;
  challengeId: string;
  expiresAt: string;
  debugCode?: string;
}

interface OtpVerifyResponse {
  ok: boolean;
  challengeId: string;
  verifiedAt: string;
}

export interface EmailOtpProps {
  disabled?: boolean;
}

export default function EmailOtp({ disabled }: EmailOtpProps) {
  const form = useFormContext<RegisterApplicationInput>();
  const email = form.watch('contactEmail');
  const emailOtpChallengeId = form.watch('emailOtpChallengeId');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const isVerified = useMemo(() => {
    if (!emailOtpChallengeId) return false;
    if (emailOtpChallengeId === '00000000-0000-0000-0000-000000000000') return false;
    return true;
  }, [emailOtpChallengeId]);

  async function send() {
    const ok = await form.trigger('contactEmail');
    if (!ok) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'EMAIL', email, purpose: 'ONBOARDING_EMAIL' }),
      });
      if (!res.ok) throw new Error('Unable to send OTP');
      const body = (await res.json()) as OtpSendResponse;
      if (!body.challengeId) throw new Error('Unable to send OTP');
      setChallengeId(body.challengeId);
      form.setValue('emailOtpChallengeId', '00000000-0000-0000-0000-000000000000', { shouldValidate: true });
      toast.success('OTP sent.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to send OTP');
    } finally {
      setIsSending(false);
    }
  }

  async function verify() {
    if (!challengeId) {
      toast.error('Send OTP first');
      return;
    }
    if (!code.trim()) {
      toast.error('Enter OTP');
      return;
    }
    setIsVerifying(true);
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, code }),
      });
      if (!res.ok) throw new Error('Invalid OTP');
      const body = (await res.json()) as OtpVerifyResponse;
      form.setValue('emailOtpChallengeId', body.challengeId, { shouldValidate: true });
      toast.success('Email verified.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invalid OTP');
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="flex items-start gap-3">
      <div className="min-w-0 flex-1 space-y-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter OTP"
          inputMode="numeric"
          disabled={disabled || isVerified}
        />
        {isVerified ? <p className="text-xs font-semibold text-emerald-700">Verified</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button type="button" onClick={send} disabled={disabled || isSending} className="h-[60px] rounded-full px-8">
          {isSending ? 'Sending' : 'Send OTP'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={verify}
          disabled={disabled || isVerifying || isVerified}
          className="h-[60px] rounded-full px-8"
        >
          {isVerifying ? 'Verifying' : 'Verify'}
        </Button>
      </div>
    </div>
  );
}

