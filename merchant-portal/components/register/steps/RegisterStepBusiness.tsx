'use client';

import Link from 'next/link';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import RegisterFormCard from '@/components/register/RegisterFormCard';
import RegisterStepHeader from '@/components/register/RegisterStepHeader';
import EmailOtp from '@/components/register/steps/business/EmailOtp';
import { cn } from '@/lib/utils/cn';
import type { RegisterApplicationInput } from '@/lib/schemas/register';
import { useFormContext } from 'react-hook-form';

function errorText(message?: string) {
  return message ? <p className="mt-2 text-sm text-red-600">{message}</p> : null;
}

const fieldShell = '[&_input]:h-[60px] [&_input]:rounded-[10px] [&_input]:border-0 [&_input]:bg-[#F3F4F6]';

const CATEGORIES = [
  'Food & Beverage',
  'Retail & Fashion',
  'Health & Beauty',
  'Professional Services',
  'Other',
] as const;

const OUTLET_PRESETS: { label: string; value: number }[] = [
  { label: 'Single', value: 1 },
  { label: '2–5', value: 3 },
  { label: '6–20', value: 10 },
  { label: '20+', value: 25 },
];

export interface RegisterStepBusinessProps {
  onNext: () => void;
}

export default function RegisterStepBusiness({ onNext }: RegisterStepBusinessProps) {
  const form = useFormContext<RegisterApplicationInput>();
  const outlets = form.watch('outletsCount');

  return (
    <div className="space-y-[30px]">
      <RegisterStepHeader
        stepIndex={1}
        title="Welcome"
        description="Start earning repeat customers today. Tell us about the identity of your enterprise to begin your journey."
      />

      <RegisterFormCard showRequired>
        <div className={cn('grid gap-8 md:grid-cols-2', fieldShell)}>
          <div className="md:col-span-2">
            <Label htmlFor="businessName" className="tracking-[0.06em]">
              Business Name
            </Label>
            <Input id="businessName" placeholder="e.g. Sovereign Blue Cafe" {...form.register('businessName')} />
            {errorText(form.formState.errors.businessName?.message)}
          </div>

          <div>
            <Label htmlFor="category" className="tracking-[0.06em]">
              Category
            </Label>
            <div className="relative">
              <select
                id="category"
                className={cn(
                  'h-[60px] w-full appearance-none rounded-[10px] border-0 bg-[#F3F4F6] px-5 pr-12 text-base text-zinc-900 outline-none',
                  'focus:bg-zinc-50 focus:ring-2 focus:ring-primary/30',
                )}
                {...form.register('category')}
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {errorText(form.formState.errors.category?.message)}
          </div>

          <div>
            <Label htmlFor="contactName" className="tracking-[0.06em]">
              Contact Person
            </Label>
            <Input id="contactName" placeholder="Full Name" {...form.register('contactName')} />
            {errorText(form.formState.errors.contactName?.message)}
          </div>

          <div>
            <Label htmlFor="pan" className="tracking-[0.06em]">
              PAN No
            </Label>
            <Input id="pan" placeholder="ABCDE1234F" {...form.register('pan')} />
            {errorText(form.formState.errors.pan?.message)}
          </div>

          <div>
            <Label htmlFor="gstin" className="tracking-[0.06em]">
              GSTIN
            </Label>
            <Input id="gstin" placeholder="22AAAAA0000A1Z5" {...form.register('gstin')} />
            {errorText(form.formState.errors.gstin?.message)}
          </div>

          <div>
            <Label htmlFor="contactPhone" className="tracking-[0.06em]">
              Mobile Number
            </Label>
            <Input id="contactPhone" placeholder="+91 00000 00000" {...form.register('contactPhone')} />
            {errorText(form.formState.errors.contactPhone?.message)}
          </div>

          <div>
            <Label htmlFor="contactEmail" className="tracking-[0.06em]">
              Business Email
            </Label>
            <Input
              id="contactEmail"
              type="email"
              placeholder="contact@business.com"
              autoComplete="email"
              {...form.register('contactEmail')}
            />
            {errorText(form.formState.errors.contactEmail?.message)}
          </div>

          <div>
            <Label htmlFor="password" className="tracking-[0.06em]">
              Password
            </Label>
            <Input id="password" type="password" autoComplete="new-password" {...form.register('password')} />
            {errorText(form.formState.errors.password?.message)}
          </div>

          <div>
            <Label className="tracking-[0.06em]">Email Verification</Label>
            <EmailOtp />
            {errorText(form.formState.errors.emailOtpChallengeId?.message)}
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="tracking-[0.06em]">
              Confirm Password
            </Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" {...form.register('confirmPassword')} />
            {errorText(form.formState.errors.confirmPassword?.message)}
          </div>

          <div className="md:col-span-2">
            <Label className="tracking-[0.06em]">Number of Outlets</Label>
            <div className="mt-2 flex w-full items-stretch justify-between gap-2 sm:gap-3">
              {OUTLET_PRESETS.map((o) => (
                <button
                  key={o.label}
                  type="button"
                  onClick={() => form.setValue('outletsCount', o.value, { shouldValidate: true })}
                  className={cn(
                    'flex min-h-[58px] min-w-0 flex-1 basis-0 items-center justify-center rounded-xl border px-2 text-center text-base font-semibold transition-colors sm:px-3',
                    Number(outlets) === o.value
                      ? 'border-primary bg-primary text-white shadow-[0_15px_30px_-8px_rgba(241,30,105,0.45)]'
                      : 'border-[#E7E7E7] bg-[#F3F4F6] text-[#011D35] hover:border-zinc-300',
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {errorText(form.formState.errors.outletsCount?.message)}
          </div>
        </div>
      </RegisterFormCard>

      <div className="space-y-6">
        <Button
          type="button"
          size="lg"
          className="h-[68px] w-full rounded-full text-lg font-black tracking-wide shadow-[0_15px_30px_-8px_rgba(241,30,105,0.45)]"
          onClick={onNext}
        >
          Continue to Step 2
        </Button>
        <p className="text-center text-xs leading-relaxed text-black">
          By creating an account, you acknowledge that you have read and agree to Perkzio&apos;s{' '}
          <Link href="/login" className="font-bold text-black underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/login" className="font-bold text-black underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex flex-wrap items-center justify-center gap-1 pt-[31.5px] text-sm text-[#4B5563]">
          <span className="font-medium">Already have an account?</span>
          <Link href="/login" className="font-bold text-black underline">
            Log in to Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
