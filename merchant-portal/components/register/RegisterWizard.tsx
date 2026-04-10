'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, type Resolver, useForm } from 'react-hook-form';
import RegisterLayout from '@/components/register/RegisterLayout';
import RegisterStepBusiness from '@/components/register/steps/RegisterStepBusiness';
import RegisterStepLocation from '@/components/register/steps/RegisterStepLocation';
import RegisterStepPlan from '@/components/register/steps/RegisterStepPlan';
import RegisterStepSuccess from '@/components/register/steps/RegisterStepSuccess';
import { registerApplicationSchema, type RegisterApplicationInput } from '@/lib/schemas/register';

const defaultRegisterValues: RegisterApplicationInput = {
  businessName: '',
  category: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
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
  gstCertFileName: '',
  panCardFileName: '',
  addressProofFileName: '',
  shopPhotoFileName: '',
  plan: 'GROWTH',
  billingCycle: 'MONTHLY',
};

export default function RegisterWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

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
      'pan',
      'outletsCount',
      'gstin',
    ]);
    if (ok) setStep(2);
  }

  async function goNextFromLocation() {
    const ok = await form.trigger(['addressLine1', 'city', 'state', 'pinCode', 'mapsUrl']);
    if (ok) setStep(3);
  }

  function goBack() {
    setStep((s) => (s <= 1 ? 1 : ((s - 1) as 1 | 2 | 3 | 4)));
  }

  return (
    <FormProvider {...form}>
      <RegisterLayout>
        {step === 1 ? (
          <RegisterStepBusiness onNext={goNextFromBusiness} />
        ) : null}
        {step === 2 ? <RegisterStepLocation onNext={goNextFromLocation} onBack={goBack} /> : null}
        {step === 3 ? <RegisterStepPlan onBack={goBack} onSubmitted={() => setStep(4)} /> : null}
        {step === 4 ? <RegisterStepSuccess /> : null}
      </RegisterLayout>
    </FormProvider>
  );
}
