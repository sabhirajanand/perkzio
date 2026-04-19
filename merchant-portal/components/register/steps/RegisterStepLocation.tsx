'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import RegisterFormCard from '@/components/register/RegisterFormCard';
import RegisterStepHeader from '@/components/register/RegisterStepHeader';
import RegisterStepNav from '@/components/register/RegisterStepNav';
import ImageUpload from '@/components/register/steps/location/ImageUpload';
import MapPicker from '@/components/register/steps/location/MapPicker';
import { Image as GalleryIcon } from 'lucide-react';
import {
  ComplianceIcon,
  ClockIcon,
  CloudUploadIcon,
  LocationPinIcon,
  WebIcon,
} from '@/components/register/steps/location/Icons';
import OperatingHoursCard from '@/components/register/steps/location/OperatingHoursCard';
import UploadQueue, { type UploadQueueItem } from '@/components/register/steps/location/UploadQueue';
import { INDIAN_STATES } from '@/lib/indian-states';
import { isRegistrationImageOverLimit } from '@/lib/register/registrationImageLimits';
import type { RegisterApplicationInput } from '@/lib/schemas/register';
import { cn } from '@/lib/utils/cn';

function errorText(message?: string) {
  return message ? <p className="mt-2 text-sm text-red-600">{message}</p> : null;
}

const fieldShell =
  '[&_input]:h-[60px] [&_input]:rounded-[10px] [&_input]:border-0 [&_input]:bg-[#F3F4F6] [&_input]:px-5';

const selectClass =
  'h-[60px] w-full appearance-none rounded-[10px] border-0 bg-[#F3F4F6] px-5 pr-10 text-base text-zinc-900 outline-none focus:bg-zinc-50 focus:ring-2 focus:ring-primary/30';

const LOCATION_FIELDS: (keyof RegisterApplicationInput)[] = [
  'addressLine1',
  'city',
  'state',
  'pinCode',
  'mapsUrl',
  'insideViewFileName',
  'outsideViewFileName',
  'logoFileName',
];

export interface RegisterStepLocationProps {
  onNext: () => void;
  onBack: () => void;
  selectedFiles: {
    inside?: File;
    outside?: File;
    logo?: File;
  };
  onSelectedFilesChange: (next: { inside?: File; outside?: File; logo?: File }) => void;
}

export default function RegisterStepLocation({
  onNext,
  onBack,
  selectedFiles,
  onSelectedFilesChange,
}: RegisterStepLocationProps) {
  const form = useFormContext<RegisterApplicationInput>();
  const mapsUrl = form.watch('mapsUrl');
  const insideViewUrl = form.watch('insideViewUrl');
  const outsideViewUrl = form.watch('outsideViewUrl');
  const logoUrl = form.watch('logoUrl');
  const insideViewFileName = form.watch('insideViewFileName');
  const outsideViewFileName = form.watch('outsideViewFileName');
  const logoFileName = form.watch('logoFileName');
  const [uploads, setUploads] = useState<UploadQueueItem[]>([]);
  const [resolvedMapsUrl, setResolvedMapsUrl] = useState<string>('');
  const [mapsEmbedUrl, setMapsEmbedUrl] = useState<string>('');

  async function continueLocation() {
    const imageFiles = [selectedFiles.inside, selectedFiles.outside, selectedFiles.logo];
    if (imageFiles.some((f) => f && isRegistrationImageOverLimit(f))) {
      toast.error('Max file size is 5MB');
      return;
    }
    const ok = await form.trigger(LOCATION_FIELDS);
    if (ok) onNext();
  }

  const mapsResolveKey = useMemo(() => mapsUrl?.trim() || '', [mapsUrl]);

  useEffect(() => {
    if (!mapsResolveKey) return;

    const t = window.setTimeout(async () => {
      try {
        const res = await fetch('/api/maps/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: mapsResolveKey }),
        });
        const body = (await res.json().catch(() => null)) as { resolvedUrl?: string } | { message?: string } | null;
        if (!res.ok || !body || typeof body !== 'object' || !('resolvedUrl' in body) || !body.resolvedUrl) {
          setResolvedMapsUrl('');
          setMapsEmbedUrl('');
          return;
        }

        const resolved = String(body.resolvedUrl);
        setResolvedMapsUrl(resolved);

        // Best-effort embed URL generation:
        // - If we can extract @lat,lng from the resolved maps URL, use q=lat,lng with output=embed
        // - Otherwise, try adding output=embed to the resolved Google Maps URL
        const coordMatch = resolved.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
        if (coordMatch) {
          const lat = coordMatch[1];
          const lng = coordMatch[2];
          setMapsEmbedUrl(`https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=16&output=embed`);
          return;
        }

        try {
          const u = new URL(resolved);
          if (u.hostname.includes('google.') && u.pathname.includes('/maps')) {
            u.searchParams.set('output', 'embed');
            setMapsEmbedUrl(u.toString());
            return;
          }
        } catch {
          // ignore
        }

        setMapsEmbedUrl('');
      } catch {
        setResolvedMapsUrl('');
        setMapsEmbedUrl('');
      }
    }, 450);

    return () => window.clearTimeout(t);
  }, [mapsResolveKey]);

  // kept for future if we need link-resolution again
  void mapsResolveKey;
  void resolvedMapsUrl;
  void mapsEmbedUrl;

  return (
    <div className="space-y-[30px]">
      <RegisterStepHeader
        stepIndex={2}
        title={
          <>
            Business Location & <span className="text-primary">Verification</span>
          </>
        }
        description="Verify your registered address and upload the documents we need to activate payouts and stay compliant."
      />
      <RegisterStepNav onBack={onBack} onContinue={undefined} className="justify-start" />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6">
          <RegisterFormCard className={cn('rounded-[24px] shadow-none', fieldShell)}>
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <LocationPinIcon className="h-5 w-5 text-black" />
                <h2 className="text-[20px] font-bold leading-7 text-black">Registered Address</h2>
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
                    }}
                    label="Set location on map"
                  />
                  {errorText(form.formState.errors.mapsUrl?.message)}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="addressLine1">Registered Business Address *</Label>
                  <Input
                    id="addressLine1"
                    placeholder="Building Name, Street Address, Area"
                    {...form.register('addressLine1')}
                  />
                  {errorText(form.formState.errors.addressLine1?.message)}
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" placeholder="e.g. Mumbai" {...form.register('city')} />
                  {errorText(form.formState.errors.city?.message)}
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <div className="relative">
                    <select id="state" className={selectClass} {...form.register('state')}>
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
                  <Label htmlFor="pinCode">PIN Code *</Label>
                  <Input id="pinCode" placeholder="400001" {...form.register('pinCode')} />
                  {errorText(form.formState.errors.pinCode?.message)}
                </div>
              </div>
            </section>
          </RegisterFormCard>

          <RegisterFormCard className="rounded-[24px] shadow-none">
            <div className="flex items-center gap-3 pb-2">
              <ClockIcon className="h-5 w-5 text-black" />
              <span className="text-[20px] font-bold leading-7 text-black">Outlet Operating Hours</span>
            </div>
            <OperatingHoursCard />
          </RegisterFormCard>
        </div>

        <div className="space-y-6">
          <RegisterFormCard className="rounded-[24px] shadow-none">
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <CloudUploadIcon className="h-6 w-6 text-black" />
                <h2 className="text-[20px] font-bold leading-7 text-black">Upload your logo and photos</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <ImageUpload
                  title="Inside view"
                  description="Inside view of the outlet showing business setup and working area."
                  icon={<CloudUploadIcon />}
                  kind="inside"
                  deferUpload
                  onSelectedFile={(file) => onSelectedFilesChange({ ...selectedFiles, inside: file })}
                  valueUrl={insideViewUrl || ''}
                  fileName={insideViewFileName}
                  onProgress={(item) =>
                    setUploads((prev) => [
                      item,
                      ...prev.filter((p) => p.id !== item.id),
                    ])
                  }
                  onUploaded={({ fileName }) => {
                    form.setValue('insideViewFileName', fileName, { shouldValidate: true });
                    form.setValue('insideViewUrl', '', { shouldValidate: true });
                  }}
                />
                <ImageUpload
                  title="Outside view"
                  description="Exterior photo of the shop provided to verify business premises."
                  icon={<ComplianceIcon />}
                  kind="outside"
                  deferUpload
                  onSelectedFile={(file) => onSelectedFilesChange({ ...selectedFiles, outside: file })}
                  valueUrl={outsideViewUrl || ''}
                  fileName={outsideViewFileName}
                  onProgress={(item) =>
                    setUploads((prev) => [
                      item,
                      ...prev.filter((p) => p.id !== item.id),
                    ])
                  }
                  onUploaded={({ fileName }) => {
                    form.setValue('outsideViewFileName', fileName, { shouldValidate: true });
                    form.setValue('outsideViewUrl', '', { shouldValidate: true });
                  }}
                />
              </div>
              <div className="grid gap-4">
                <ImageUpload
                  title="Logo upload"
                  description="Upload your brand logo for the portal and customer-facing pages."
                  icon={<GalleryIcon />}
                  kind="logo"
                  variant="flat"
                  showAction={false}
                  deferUpload
                  onSelectedFile={(file) => onSelectedFilesChange({ ...selectedFiles, logo: file })}
                  valueUrl={logoUrl || ''}
                  fileName={logoFileName}
                  onProgress={(item) =>
                    setUploads((prev) => [
                      item,
                      ...prev.filter((p) => p.id !== item.id),
                    ])
                  }
                  onUploaded={({ fileName }) => {
                    form.setValue('logoFileName', fileName, { shouldValidate: true });
                    form.setValue('logoUrl', '', { shouldValidate: true });
                  }}
                />
              </div>
              <UploadQueue
                items={uploads}
                onRemove={(id) => {
                  const kind = id.split(':')[0] as 'inside' | 'outside' | 'logo';
                  if (kind === 'inside') {
                    form.setValue('insideViewUrl', '', { shouldValidate: true });
                    form.setValue('insideViewFileName', '', { shouldValidate: true });
                    onSelectedFilesChange({ ...selectedFiles, inside: undefined });
                  }
                  if (kind === 'outside') {
                    form.setValue('outsideViewUrl', '', { shouldValidate: true });
                    form.setValue('outsideViewFileName', '', { shouldValidate: true });
                    onSelectedFilesChange({ ...selectedFiles, outside: undefined });
                  }
                  if (kind === 'logo') {
                    form.setValue('logoUrl', '', { shouldValidate: true });
                    form.setValue('logoFileName', '', { shouldValidate: true });
                    onSelectedFilesChange({ ...selectedFiles, logo: undefined });
                  }
                  setUploads((prev) => prev.filter((p) => p.id !== id));
                }}
              />
            </section>
          </RegisterFormCard>

          <RegisterFormCard className={cn('rounded-[24px] shadow-none', fieldShell)}>
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <WebIcon className="h-5 w-5 text-black" />
                <h2 className="text-[20px] font-bold leading-7 text-black">Digital Presence</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="website">Official Website</Label>
                  <Input id="website" placeholder="www.yourbusiness.com" {...form.register('website')} />
                  {errorText(form.formState.errors.website?.message)}
                </div>
                <div>
                  <Label htmlFor="googleBusinessUrl">Google Link</Label>
                  <Input
                    id="googleBusinessUrl"
                    placeholder="@Google"
                    {...form.register('googleBusinessUrl')}
                  />
                  {errorText(form.formState.errors.googleBusinessUrl?.message)}
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" placeholder="@handle" {...form.register('instagram')} />
                  {errorText(form.formState.errors.instagram?.message)}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input id="facebook" placeholder="fb.com/page" {...form.register('facebook')} />
                  {errorText(form.formState.errors.facebook?.message)}
                </div>
              </div>
            </section>
          </RegisterFormCard>
        </div>
      </div>

      <RegisterStepNav onContinue={continueLocation} />
    </div>
  );
}
