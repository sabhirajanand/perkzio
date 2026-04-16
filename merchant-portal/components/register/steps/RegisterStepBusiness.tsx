'use client';

import Link from 'next/link';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Select from '@/components/ui/Select';
import RegisterFormCard from '@/components/register/RegisterFormCard';
import RegisterStepHeader from '@/components/register/RegisterStepHeader';
import RegisterStepNav from '@/components/register/RegisterStepNav';
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

export interface RegisterStepBusinessProps {
  onNext: () => void;
}

export default function RegisterStepBusiness({ onNext }: RegisterStepBusinessProps) {
  const form = useFormContext<RegisterApplicationInput>();
  const category = form.watch('category');
  const pan = form.watch('pan');

  return (
    <div className="space-y-[30px]">
      <RegisterStepHeader
        stepIndex={1}
        title="Welcome"
        description="Start earning repeat customers today. Tell us about the identity of your enterprise to begin your journey."
      />

      <RegisterFormCard>
        <div className={cn('grid gap-8 md:grid-cols-2', fieldShell)}>
          <div className="md:col-span-2">
            <Label htmlFor="businessName" className="tracking-[0.06em]">
              Business Name *
            </Label>
            <Input id="businessName" placeholder="Sovereign Blue Cafe" {...form.register('businessName')} />
            {errorText(form.formState.errors.businessName?.message)}
          </div>

          <div>
            <Label htmlFor="category" className="tracking-[0.06em]">
              Category *
            </Label>
            <Select
              id="category"
              value={category || ''}
              placeholder="Select Category"
              onValueChange={(v) => form.setValue('category', v, { shouldValidate: true })}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
            {errorText(form.formState.errors.category?.message)}
          </div>

          <div>
            <Label htmlFor="contactName" className="tracking-[0.06em]">
              Merchant Name *
            </Label>
            <Input id="contactName" placeholder="Full Name" {...form.register('contactName')} />
            {errorText(form.formState.errors.contactName?.message)}
          </div>

          <div>
            <Label htmlFor="gstin" className="tracking-[0.06em]">
              GSTIN (optional)
            </Label>
            <Input
              id="gstin"
              placeholder="15 characters (A-Z, 0-9)"
              {...form.register('gstin', {
                setValueAs: (v) => (typeof v === 'string' ? v.trim().toUpperCase() : v),
              })}
            />
            {errorText(form.formState.errors.gstin?.message)}
          </div>

          <div>
            <Label htmlFor="pan" className="tracking-[0.06em]">
              PAN (optional)
            </Label>
            <Input
              id="pan"
              placeholder="ABCDE1234F"
              maxLength={10}
              value={pan || ''}
              {...form.register('pan', {
                onChange: (e) => form.setValue('pan', String(e.target.value || '').toUpperCase(), { shouldValidate: true }),
              })}
            />
            {errorText(form.formState.errors.pan?.message)}
          </div>

          <div>
            <Label htmlFor="contactPhone" className="tracking-[0.06em]">
              Mobile Number *
            </Label>
            <div className="flex h-[60px] items-center rounded-[10px] bg-[#F3F4F6] focus-within:bg-zinc-50 focus-within:ring-2 focus-within:ring-primary/30">
              <span className="shrink-0 pl-5 pr-2 text-base text-zinc-900">+91</span>
              <input
                id="contactPhone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="00000 00000"
                maxLength={10}
                className="h-full w-full rounded-[10px] bg-transparent pr-5 text-base text-zinc-900 placeholder:text-zinc-500 outline-none"
                {...form.register('contactPhone', {
                  setValueAs: (v) => (typeof v === 'string' ? v.replace(/\D/g, '').slice(0, 10) : v),
                })}
              />
            </div>
            {errorText(form.formState.errors.contactPhone?.message)}
          </div>

          <div>
            <Label htmlFor="contactEmail" className="tracking-[0.06em]">
              Email *
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
              Password *
            </Label>
            <Input id="password" type="password" autoComplete="new-password" {...form.register('password')} />
            {errorText(form.formState.errors.password?.message)}
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="tracking-[0.06em]">
              Confirm Password *
            </Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" {...form.register('confirmPassword')} />
            {errorText(form.formState.errors.confirmPassword?.message)}
          </div>
        </div>
      </RegisterFormCard>

      <div className="space-y-6">
        <RegisterStepNav onContinue={onNext} />
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
