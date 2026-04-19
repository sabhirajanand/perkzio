'use client';

import { useFormContext } from 'react-hook-form';

import RegisterFormCard from '@/components/register/RegisterFormCard';
import ImageUpload from '@/components/register/steps/location/ImageUpload';
import MapPicker from '@/components/register/steps/location/MapPicker';
import OperatingHoursCard from '@/components/register/steps/location/OperatingHoursCard';
import {
  ClockIcon,
  CloudUploadIcon,
  ComplianceIcon,
  LocationPinIcon,
  WebIcon,
} from '@/components/register/steps/location/Icons';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import type { BranchRequestFormInput } from '@/lib/schemas/branchRequest';
import { INDIAN_STATES } from '@/lib/indian-states';
import { cn } from '@/lib/utils/cn';

function errorText(message?: string) {
  return message ? <p className="mt-2 text-sm text-red-600">{message}</p> : null;
}

const fieldShell =
  '[&_input]:h-[60px] [&_input]:rounded-[10px] [&_input]:border-0 [&_input]:bg-[#F3F4F6] [&_input]:px-5';

const selectClass =
  'h-[60px] w-full appearance-none rounded-[10px] border-0 bg-[#F3F4F6] px-5 pr-10 text-base text-zinc-900 outline-none focus:bg-zinc-50 focus:ring-2 focus:ring-primary/30';

export default function BranchRequestOutletFields() {
  const form = useFormContext<BranchRequestFormInput>();
  const mapsUrl = form.watch('mapsUrl');
  const insideViewUrl = form.watch('insideViewUrl');
  const outsideViewUrl = form.watch('outsideViewUrl');
  const insideViewKey = form.watch('insideViewKey');
  const outsideViewKey = form.watch('outsideViewKey');
  const openingHours = form.watch('openingHours');

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div className="space-y-6">
        <RegisterFormCard className={cn('rounded-[24px] shadow-none', fieldShell)}>
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <LocationPinIcon className="h-5 w-5 text-black" />
              <h2 className="text-[20px] font-bold leading-7 text-black">Branch address</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <MapPicker
                  value={mapsUrl}
                  onValueChange={(v) => form.setValue('mapsUrl', v, { shouldValidate: true })}
                  onResolvedAddress={(a) => {
                    form.setValue('addressLine1', a.formattedAddress, { shouldValidate: true });
                    form.setValue('city', a.city, { shouldValidate: true });
                    form.setValue('state', a.state, { shouldValidate: true });
                    if (a.pinCode) form.setValue('pinCode', a.pinCode, { shouldValidate: true });
                    form.setValue('latitude', a.lat, { shouldValidate: true });
                    form.setValue('longitude', a.lng, { shouldValidate: true });
                  }}
                  label="Set location on map"
                />
                {errorText(form.formState.errors.mapsUrl?.message)}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="branch-addressLine1">Branch address *</Label>
                <Input id="branch-addressLine1" placeholder="Building, street, area" {...form.register('addressLine1')} />
                {errorText(form.formState.errors.addressLine1?.message)}
              </div>
              <div>
                <Label htmlFor="branch-city">City *</Label>
                <Input id="branch-city" placeholder="e.g. Mumbai" {...form.register('city')} />
                {errorText(form.formState.errors.city?.message)}
              </div>
              <div>
                <Label htmlFor="branch-state">State *</Label>
                <div className="relative">
                  <select id="branch-state" className={selectClass} {...form.register('state')}>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                {errorText(form.formState.errors.state?.message)}
              </div>
              <div>
                <Label htmlFor="branch-pinCode">PIN code *</Label>
                <Input id="branch-pinCode" placeholder="400001" {...form.register('pinCode')} />
                {errorText(form.formState.errors.pinCode?.message)}
              </div>
            </div>
          </section>
        </RegisterFormCard>

        <RegisterFormCard className="rounded-[24px] shadow-none">
          <div className="flex items-center gap-3 pb-2">
            <ClockIcon className="h-5 w-5 text-black" />
            <span className="text-[20px] font-bold leading-7 text-black">Outlet operating hours</span>
          </div>
          <OperatingHoursCard
            value={openingHours}
            onChange={(h) => form.setValue('openingHours', h, { shouldValidate: true })}
          />
        </RegisterFormCard>
      </div>

      <div className="space-y-6">
        <RegisterFormCard className="rounded-[24px] shadow-none">
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <CloudUploadIcon className="h-6 w-6 text-black" />
              <h2 className="text-[20px] font-bold leading-7 text-black">Branch photos</h2>
            </div>
            <p className="text-sm text-zinc-600">
              Logo stays the same for your brand. Upload inside and outside views of this branch only.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUpload
                title="Inside view"
                description="Inside view of this outlet."
                icon={<CloudUploadIcon />}
                kind="inside"
                deferUpload={false}
                valueUrl={insideViewUrl || ''}
                fileName={insideViewKey || ''}
                onUploaded={({ url, key }) => {
                  form.setValue('insideViewKey', key, { shouldValidate: true });
                  form.setValue('insideViewUrl', url, { shouldValidate: true });
                }}
              />
              <ImageUpload
                title="Outside view"
                description="Exterior photo of this branch."
                icon={<ComplianceIcon />}
                kind="outside"
                deferUpload={false}
                valueUrl={outsideViewUrl || ''}
                fileName={outsideViewKey || ''}
                onUploaded={({ url, key }) => {
                  form.setValue('outsideViewKey', key, { shouldValidate: true });
                  form.setValue('outsideViewUrl', url, { shouldValidate: true });
                }}
              />
            </div>
            {errorText(form.formState.errors.insideViewKey?.message)}
            {errorText(form.formState.errors.outsideViewKey?.message)}
          </section>
        </RegisterFormCard>

        <RegisterFormCard className={cn('rounded-[24px] shadow-none', fieldShell)}>
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <WebIcon className="h-5 w-5 text-black" />
              <h2 className="text-[20px] font-bold leading-7 text-black">Digital presence</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="branch-website">Official website</Label>
                <Input id="branch-website" placeholder="www.yourbusiness.com" {...form.register('website')} />
              </div>
              <div>
                <Label htmlFor="branch-google">Google Business</Label>
                <Input id="branch-google" placeholder="Maps link" {...form.register('googleBusinessUrl')} />
              </div>
              <div>
                <Label htmlFor="branch-instagram">Instagram</Label>
                <Input id="branch-instagram" placeholder="@handle" {...form.register('instagram')} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="branch-facebook">Facebook</Label>
                <Input id="branch-facebook" placeholder="fb.com/page" {...form.register('facebook')} />
              </div>
            </div>
          </section>
        </RegisterFormCard>
      </div>
    </div>
  );
}
