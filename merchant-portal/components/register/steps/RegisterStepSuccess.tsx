'use client';

import Link from 'next/link';
import Image from 'next/image';
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

      <div className="relative z-10 mx-auto w-full max-w-[920px] text-center">
        <h1 className="text-2xl font-bold leading-tight text-[#011D35] md:text-3xl md:leading-[48px] [font-family:var(--font-register-display),ui-serif,Georgia,serif]">
          Application Successfully Submitted!
        </h1>
        <p className="mt-6 whitespace-pre-line text-sm font-medium leading-relaxed text-zinc-900">
          Your application is now under review.
          {'\n'}You can expect approval within <span className="font-bold">~2 business days.</span>
        </p>

        <div className="mx-auto mt-10 w-full grid gap-6 text-left md:w-4/5 md:grid-cols-[40fr_60fr]">
          <div className="flex items-center justify-center rounded-2xl bg-white px-8 py-7 text-center ring-1 ring-black/5">
            <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Reference ID</p>
            <p className="mt-4 font-mono text-2xl font-semibold tracking-tight text-[#011D35]">{referenceId}</p>
            </div>
          </div>

          <div className="relative rounded-2xl bg-white px-8 py-7 ring-1 ring-black/5">
            <div className="pointer-events-none absolute right-5 top-5 opacity-50" aria-hidden>
              <Image src="/Images/success-icon.svg" alt="" width={56} height={56} className="h-14 w-14" />
            </div>
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                  <path
                    d="M4 6h16v12H4V6zm0 0l8 7 8-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">
                A confirmation notice has been sent to{'\n'}
                <span className="font-semibold text-zinc-900">{phone || 'your registered mobile'}</span> via WhatsApp & SMS.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/">
            <Button
              size="lg"
              className="min-w-[220px] rounded-full bg-[linear-gradient(99.13deg,#F11E69_0%,#FF4FA3_100%)] shadow-[0_18px_40px_-18px_rgba(241,30,105,0.9)]"
            >
              Go to Homepage
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" className="min-w-[220px] rounded-full bg-[#272B2A] text-white hover:bg-black/80">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
