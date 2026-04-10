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

export interface PhoneOtpProps {
  disabled?: boolean;
}

export default function PhoneOtp({ disabled }: PhoneOtpProps) {
  const form = useFormContext<RegisterApplicationInput>();
  const phone = form.watch('contactPhone');
  const otpChallengeId = form.watch('otpChallengeId');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const isVerified = useMemo(() => {
    if (!otpChallengeId) return false;
    if (otpChallengeId === '00000000-0000-0000-0000-000000000000') return false;
    return true;
  }, [otpChallengeId]);

  async function send() {
    const ok = await form.trigger('contactPhone');
    if (!ok) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'ONBOARDING' }),
      });
      if (!res.ok) throw new Error('Unable to send OTP');
      const body = (await res.json()) as OtpSendResponse;
      if (!body.challengeId) throw new Error('Unable to send OTP');
      setChallengeId(body.challengeId);
      form.setValue('otpChallengeId', '00000000-0000-0000-0000-000000000000', { shouldValidate: true });
      if (body.debugCode) {
        toast.success(`OTP sent. Dev code: ${body.debugCode}`);
      } else {
        toast.success('OTP sent.');
      }
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
      form.setValue('otpChallengeId', body.challengeId, { shouldValidate: true });
      toast.success('Phone verified.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invalid OTP');
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
      <div className="space-y-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter OTP"
          inputMode="numeric"
          disabled={disabled || isVerified}
        />
        {isVerified ? <p className="text-xs font-semibold text-emerald-700">Verified</p> : null}
      </div>
      <div className="flex gap-2 sm:flex-col">
        <Button type="button" onClick={send} disabled={disabled || isSending}>
          {isSending ? 'Sending' : 'Send OTP'}
        </Button>
        <Button type="button" variant="secondary" onClick={verify} disabled={disabled || isVerifying || isVerified}>
          {isVerifying ? 'Verifying' : 'Verify'}
        </Button>
      </div>
    </div>
  );
}

