'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Spinner from '@/components/ui/spinner';
import {
  onboardingApplicationSchema,
  type OnboardingApplicationInput,
} from '@/lib/schemas/onboarding';

export interface LocationDocumentsFormProps {
  initial?: Partial<OnboardingApplicationInput>;
}

function errorText(message?: string) {
  return message ? <p className="mt-2 text-sm text-red-600">{message}</p> : null;
}

export default function LocationDocumentsForm({ initial }: LocationDocumentsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaults = useMemo<OnboardingApplicationInput>(
    () => ({
      businessName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      outletsCount: 1,
      gstin: '',
      city: '',
      addressLine1: '',
      plan: 'GROWTH',
      billingCycle: 'MONTHLY',
      ...(initial || {}),
    }),
    [initial],
  );

  const form = useForm<OnboardingApplicationInput>({
    resolver: zodResolver(onboardingApplicationSchema) as unknown as Resolver<OnboardingApplicationInput>,
    defaultValues: defaults,
    mode: 'onBlur',
  });

  async function onNext(values: OnboardingApplicationInput) {
    setIsSubmitting(true);
    try {
      sessionStorage.setItem('onboardingDraft', JSON.stringify(values));
      router.push('/onboarding/plan-payment');
    } catch {
      toast.error('Unable to continue');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-8" onSubmit={form.handleSubmit(onNext)}>
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Business details</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Tell us about your business and primary outlet. We’ll validate and set up your merchant
          workspace.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="businessName">Business name</Label>
          <Input id="businessName" placeholder="Your business name" {...form.register('businessName')} />
          {errorText(form.formState.errors.businessName?.message)}
        </div>

        <div>
          <Label htmlFor="contactName">Contact name</Label>
          <Input id="contactName" placeholder="Full name" {...form.register('contactName')} />
          {errorText(form.formState.errors.contactName?.message)}
        </div>

        <div>
          <Label htmlFor="contactPhone">Contact phone</Label>
          <Input id="contactPhone" placeholder="+91 9XXXXXXXXX" {...form.register('contactPhone')} />
          {errorText(form.formState.errors.contactPhone?.message)}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="name@business.com"
            autoComplete="email"
            {...form.register('contactEmail')}
          />
          {errorText(form.formState.errors.contactEmail?.message)}
        </div>

        <div>
          <Label htmlFor="outletsCount">Number of outlets</Label>
          <Input id="outletsCount" type="number" min={1} max={200} {...form.register('outletsCount')} />
          {errorText(form.formState.errors.outletsCount?.message)}
        </div>

        <div>
          <Label htmlFor="gstin">GSTIN (optional)</Label>
          <Input id="gstin" placeholder="15-character GSTIN" {...form.register('gstin')} />
          {errorText(form.formState.errors.gstin?.message)}
        </div>

        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="City" {...form.register('city')} />
          {errorText(form.formState.errors.city?.message)}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="addressLine1">Address line</Label>
          <Input id="addressLine1" placeholder="Street, area, landmark" {...form.register('addressLine1')} />
          {errorText(form.formState.errors.addressLine1?.message)}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link href="/login" className="text-sm font-semibold text-zinc-700 hover:text-zinc-900">
          Back to login
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Spinner />
              Continuing
            </span>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </form>
  );
}

