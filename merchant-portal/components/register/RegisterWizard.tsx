'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import RegisterLayout from '@/components/register/RegisterLayout';
import RegisterStepBusiness from '@/components/register/steps/RegisterStepBusiness';
import RegisterStepLocation from '@/components/register/steps/RegisterStepLocation';
import RegisterStepPlan from '@/components/register/steps/RegisterStepPlan';
import RegisterStepReview from '@/components/register/steps/RegisterStepReview';
import RegisterStepSuccess from '@/components/register/steps/RegisterStepSuccess';
import { registerApplicationSchema, type RegisterApplicationInput } from '@/lib/schemas/register';

const defaultRegisterValues: RegisterApplicationInput = {
  businessName: '',
  category: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  password: '',
  confirmPassword: '',
  pan: '',
  outletsCount: 1,
  gstin: '',
  addressLine1: '',
  city: '',
  state: '',
  pinCode: '',
  mapsUrl: '',
  website: '',
  googleBusinessUrl: '',
  instagram: '',
  facebook: '',
  insideViewFileName: '',
  insideViewUrl: '',
  outsideViewFileName: '',
  outsideViewUrl: '',
  logoFileName: '',
  logoUrl: '',
  gstCertFileName: '',
  panCardFileName: '',
  addressProofFileName: '',
  shopPhotoFileName: '',
  gstCertUploadKey: '',
  panCardUploadKey: '',
  addressProofUploadKey: '',
  shopPhotoUploadKey: '',
  plan: 'GROWTH',
  billingCycle: 'MONTHLY',
};

export interface RegisterSelectedFiles {
  inside?: File;
  outside?: File;
  logo?: File;
}

export default function RegisterWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedFiles, setSelectedFiles] = useState<RegisterSelectedFiles>({});

  const form = useForm<RegisterApplicationInput>({
    resolver: zodResolver(registerApplicationSchema) as unknown as Resolver<RegisterApplicationInput>,
    defaultValues: defaultRegisterValues,
    mode: 'onBlur',
  });

  async function goNextFromBusiness() {
    const ok = await form.trigger([
      'businessName',
      'category',
      'contactName',
      'contactEmail',
      'contactPhone',
      'password',
      'confirmPassword',
      'gstin',
      'pan',
    ]);
    if (!ok) return;

    try {
      const email = form.getValues('contactEmail');
      const res = await fetch('/api/onboarding/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const body = (await res.json().catch(() => null)) as { unique?: boolean } | { message?: string } | null;
      if (!res.ok) throw new Error(body && typeof body === 'object' && 'message' in body ? String(body.message ?? 'Unable to verify email') : 'Unable to verify email');
      const unique = body && typeof body === 'object' && 'unique' in body ? Boolean((body as { unique?: unknown }).unique) : false;
      if (!unique) {
        form.setError('contactEmail', { type: 'validate', message: 'This business email is already registered.' });
        toast.error('This business email is already registered.');
        return;
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to verify email');
      return;
    }

    setStep(2);
  }

  async function goNextFromLocation() {
    const ok = await form.trigger(['addressLine1', 'city', 'state', 'pinCode', 'mapsUrl']);
    if (ok) setStep(3);
  }

  async function goNextFromPlan() {
    const ok = await form.trigger(['plan', 'billingCycle']);
    if (ok) setStep(4);
  }

  function goBack() {
    setStep((s) => (s <= 1 ? 1 : ((s - 1) as 1 | 2 | 3 | 4 | 5)));
  }

  return (
    <FormProvider {...form}>
      <RegisterLayout>
        {step === 1 ? (
          <RegisterStepBusiness onNext={goNextFromBusiness} />
        ) : null}
        {step === 2 ? (
          <RegisterStepLocation
            onNext={goNextFromLocation}
            onBack={goBack}
            selectedFiles={selectedFiles}
            onSelectedFilesChange={setSelectedFiles}
          />
        ) : null}
        {step === 3 ? <RegisterStepPlan onBack={goBack} onNext={goNextFromPlan} /> : null}
        {step === 4 ? (
          <RegisterStepReview
            onBack={goBack}
            onEditStep={(s) => setStep(s)}
            onSubmitted={() => setStep(5)}
            selectedFiles={selectedFiles}
          />
        ) : null}
        {step === 5 ? <RegisterStepSuccess /> : null}
      </RegisterLayout>
    </FormProvider>
  );
}
