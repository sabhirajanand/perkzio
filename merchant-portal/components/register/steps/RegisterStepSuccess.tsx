'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import Button from '@/components/ui/button';
import type { RegisterApplicationInput } from '@/lib/schemas/register';

function makeRefId() {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TXN-${part()}-${part()}`;
}

export default function RegisterStepSuccess() {
  const { watch } = useFormContext<RegisterApplicationInput>();
  const phone = watch('contactPhone');
  const [referenceId] = useState(() => makeRefId());

  return (
    <div className="relative flex min-h-[calc(100vh-140px)] flex-col items-center justify-center px-2 py-12">
      <div
        className="pointer-events-none absolute left-[-40px] top-[10%] h-96 w-96 rounded-full bg-[#F11E69]/10 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[5%] right-[-20px] h-96 w-96 rounded-full bg-[#FF4FA3]/10 blur-[120px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[576px] text-center">
        <h1 className="text-[32px] font-bold leading-tight text-[#011D35] md:text-[38px] md:leading-[48px] [font-family:var(--font-register-display),ui-serif,Georgia,serif]">
          Application Successfully Submitted!
        </h1>
        <p className="mt-6 whitespace-pre-line text-lg font-medium leading-relaxed text-zinc-900">
          Your application is now under review.{'\n'}You can expect approval within ~2 business days.
        </p>

        <div className="mt-10 rounded-2xl bg-white px-6 py-5 text-left ring-1 ring-black/5">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Reference ID</p>
          <p className="mt-2 font-mono text-lg font-semibold text-[#011D35]">{referenceId}</p>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-zinc-600">
            A confirmation notice has been sent to{'\n'}
            <span className="font-semibold text-zinc-900">{phone || 'your registered mobile'}</span> via WhatsApp & SMS.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/">
            <Button size="lg" className="min-w-[200px] rounded-full">
              Go to Homepage
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="min-w-[200px] rounded-full">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
