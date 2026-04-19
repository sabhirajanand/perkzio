'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { DEFAULT_OUTLET_HOURS } from '@/components/register/steps/location/OperatingHoursCard';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import { branchRequestFormSchema, type BranchRequestFormInput } from '@/lib/schemas/branchRequest';

import BranchRequestOutletFields from './BranchRequestOutletFields';

function emptyBranchRequestValues(): BranchRequestFormInput {
  return {
    branchName: '',
    mapsUrl: '',
    addressLine1: '',
    city: '',
    state: '',
    pinCode: '',
    latitude: null,
    longitude: null,
    googleMapsPlaceId: null,
    openingHours: DEFAULT_OUTLET_HOURS.map((d) => ({ ...d })),
    website: '',
    googleBusinessUrl: '',
    instagram: '',
    facebook: '',
    insideViewKey: '',
    insideViewUrl: '',
    outsideViewKey: '',
    outsideViewUrl: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    password: '',
    confirmPassword: '',
  };
}

export default function BranchRequestForm() {
  const router = useRouter();
  const form = useForm<BranchRequestFormInput>({
    resolver: zodResolver(branchRequestFormSchema),
    defaultValues: emptyBranchRequestValues(),
    mode: 'onBlur',
  });

  async function onSubmit(values: BranchRequestFormInput) {
    try {
      const res = await fetch('/api/merchant/branch-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = (await res.json().catch(() => null)) as { message?: string; ok?: boolean } | null;
      if (!res.ok) {
        toast.error(typeof json?.message === 'string' ? json.message : 'Request failed');
        return;
      }
      toast.success('Branch request submitted for admin review.');
      form.reset(emptyBranchRequestValues());
      router.refresh();
    } catch {
      toast.error('Network error');
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <section className="rounded-[24px] border border-[#B3B1B4]/10 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)] md:p-8">
          <h2 className="font-headline text-xl font-bold text-[#111827]">Request a new branch</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#6B7280]">
            Your branch and branch admin are created only after a platform administrator approves this request. The
            branch admin receives the <span className="font-semibold text-[#333235]">Branch Admin</span> role at that
            time (scoped to the new branch)—not before approval.
          </p>

          <div className="mt-8 space-y-2">
            <Label htmlFor="branchName" className="text-sm font-semibold text-[#383838]">
              Branch display name *
            </Label>
            <Input id="branchName" placeholder="e.g. Indiranagar" {...form.register('branchName')} />
            {form.formState.errors.branchName?.message ? (
              <p className="text-sm text-red-600">{form.formState.errors.branchName.message}</p>
            ) : null}
          </div>

          <div className="mt-10">
            <BranchRequestOutletFields />
          </div>

          <div className="mt-10 space-y-5 border-t border-[#ECECEC] pt-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6B7280]">Branch administrator</p>
            <p className="text-sm text-[#6B7280]">
              Same profile fields as merchant registration. This person can sign in only after approval.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="adminName">Full name *</Label>
                <Input id="adminName" autoComplete="name" {...form.register('adminName')} />
                {form.formState.errors.adminName?.message ? (
                  <p className="text-sm text-red-600">{form.formState.errors.adminName.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email *</Label>
                <Input id="adminEmail" type="email" autoComplete="off" {...form.register('adminEmail')} />
                {form.formState.errors.adminEmail?.message ? (
                  <p className="text-sm text-red-600">{form.formState.errors.adminEmail.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPhone">Mobile *</Label>
                <Input id="adminPhone" inputMode="numeric" maxLength={10} placeholder="10 digits" {...form.register('adminPhone')} />
                {form.formState.errors.adminPhone?.message ? (
                  <p className="text-sm text-red-600">{form.formState.errors.adminPhone.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input id="password" type="password" autoComplete="new-password" {...form.register('password')} />
                {form.formState.errors.password?.message ? (
                  <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...form.register('confirmPassword')}
                />
                {form.formState.errors.confirmPassword?.message ? (
                  <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
                ) : null}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="mt-10 inline-flex h-[55px] w-full max-w-md items-center justify-center rounded-full bg-gradient-to-r from-[#F11E69] to-[#FF4FA3] text-base font-bold text-white shadow-[0_10px_40px_-10px_rgba(241,30,105,0.4)] transition hover:brightness-95 disabled:opacity-60 sm:w-auto sm:px-14"
          >
            {form.formState.isSubmitting ? 'Submitting…' : 'Submit for approval'}
          </button>
        </section>
      </form>
    </FormProvider>
  );
}
