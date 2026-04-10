'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import RegisterFormCard from '@/components/register/RegisterFormCard';
import RegisterStepHeader from '@/components/register/RegisterStepHeader';
import DocUpload, { type DocUploadSlot } from '@/components/register/steps/location/DocUpload';
import {
  BoltIcon,
  CameraIcon,
  ClockIcon,
  CloudUploadIcon,
  ComplianceIcon,
  DocumentIcon,
  IdCardIcon,
  LocationPinIcon,
  TargetIcon,
  WebIcon,
} from '@/components/register/steps/location/Icons';
import OperatingHoursCard from '@/components/register/steps/location/OperatingHoursCard';
import UploadQueue, { type UploadQueueItem } from '@/components/register/steps/location/UploadQueue';
import { INDIAN_STATES } from '@/lib/indian-states';
import type { RegisterApplicationInput } from '@/lib/schemas/register';
import { cn } from '@/lib/utils/cn';

function errorText(message?: string) {
  return message ? <p className="mt-2 text-sm text-red-600">{message}</p> : null;
}

const fieldShell =
  '[&_input]:h-[60px] [&_input]:rounded-[10px] [&_input]:border-0 [&_input]:bg-[#F3F4F6] [&_input]:px-5';

const selectClass =
  'h-[60px] w-full appearance-none rounded-[10px] border-0 bg-[#F3F4F6] px-5 pr-10 text-base text-zinc-900 outline-none focus:bg-zinc-50 focus:ring-2 focus:ring-primary/30';

const DOC_SLOTS: DocUploadSlot[] = [
  {
    name: 'gstCertFileName',
    title: 'GST certificate',
    hint: 'Alternative for GST-exempt small businesses',
    icon: <CloudUploadIcon className="h-6 w-6" />,
  },
  {
    name: 'panCardFileName',
    title: 'Business PAN card',
    hint: 'Business PAN card uploaded for identity',
    icon: <IdCardIcon className="h-6 w-6" />,
  },
  {
    name: 'addressProofFileName',
    title: 'Address proof',
    hint: 'Address proof uploaded for verification',
    icon: <DocumentIcon className="h-6 w-6" />,
  },
  {
    name: 'shopPhotoFileName',
    title: 'Shop photo',
    hint: 'Exterior photo to verify your outlet',
    icon: <CameraIcon className="h-6 w-6" />,
  },
];

const LOCATION_FIELDS: (keyof RegisterApplicationInput)[] = [
  'addressLine1',
  'city',
  'state',
  'pinCode',
  'mapsUrl',
];

export interface RegisterStepLocationProps {
  onNext: () => void;
  onBack: () => void;
}

export default function RegisterStepLocation({ onNext, onBack }: RegisterStepLocationProps) {
  const form = useFormContext<RegisterApplicationInput>();
  const pan = form.watch('pan');
  const mapsUrl = form.watch('mapsUrl');
  const [uploads, setUploads] = useState<UploadQueueItem[]>([]);

  async function continueLocation() {
    const ok = await form.trigger(LOCATION_FIELDS);
    if (ok) onNext();
  }

  function bindFile(field: (typeof DOC_SLOTS)[number]['name']) {
    return async (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      form.setValue(field, f?.name ?? '', { shouldValidate: true });
      if (!f) return;

      const otpChallengeId = form.getValues('otpChallengeId');
      if (!otpChallengeId || otpChallengeId === '00000000-0000-0000-0000-000000000000') {
        toast.error('Verify your phone number first');
        return;
      }

      const docType =
        field === 'gstCertFileName'
          ? 'GST_CERT'
          : field === 'panCardFileName'
            ? 'PAN_CARD'
            : field === 'addressProofFileName'
              ? 'ADDRESS_PROOF'
              : 'SHOP_PHOTO';
      const uploadKeyField =
        field === 'gstCertFileName'
          ? 'gstCertUploadKey'
          : field === 'panCardFileName'
            ? 'panCardUploadKey'
            : field === 'addressProofFileName'
              ? 'addressProofUploadKey'
              : 'shopPhotoUploadKey';

      const id = `${String(field)}:${f.name}`;
      setUploads((prev) => [{ id, fileName: f.name, progress: 5 }, ...prev.filter((p) => p.id !== id)]);

      try {
        setUploads((prev) => prev.map((p) => (p.id === id ? { ...p, progress: 15 } : p)));
        const presignRes = await fetch('/api/kyc/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            otpChallengeId,
            documentType: docType,
            fileName: f.name,
            contentType: f.type || 'application/octet-stream',
            sizeBytes: f.size,
          }),
        });
        if (!presignRes.ok) throw new Error('Unable to upload document');
        const presignBody = (await presignRes.json()) as { uploadUrl?: string; s3Key?: string };
        if (!presignBody.uploadUrl || !presignBody.s3Key) throw new Error('Unable to upload document');

        setUploads((prev) => prev.map((p) => (p.id === id ? { ...p, progress: 40 } : p)));
        const putRes = await fetch(presignBody.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': f.type || 'application/octet-stream' },
          body: f,
        });
        if (!putRes.ok) throw new Error('Upload failed');

        form.setValue(uploadKeyField, presignBody.s3Key, { shouldValidate: true });
        setUploads((prev) => prev.map((p) => (p.id === id ? { ...p, progress: 100 } : p)));
        toast.success('Document uploaded');
      } catch (err) {
        setUploads((prev) => prev.map((p) => (p.id === id ? { ...p, progress: 0 } : p)));
        toast.error(err instanceof Error ? err.message : 'Upload failed');
      }
    };
  }

  function validateMaps() {
    form.trigger('mapsUrl').then((ok) => {
      if (ok) toast.success('Maps link looks valid.');
      else toast.error('Enter a valid Google Maps URL.');
    });
  }

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
                <div className="md:col-span-2">
                  <Label htmlFor="mapsUrl">Google Maps Place Link *</Label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <Input
                      id="mapsUrl"
                      placeholder="https://maps.google.com/..."
                      {...form.register('mapsUrl')}
                    />
                    <Button
                      type="button"
                      className="h-[60px] shrink-0 !rounded-[12px] bg-primary px-8 text-white hover:bg-primary/90"
                      onClick={validateMaps}
                    >
                      <span className="inline-flex items-center gap-2">
                        <BoltIcon className="h-4 w-4" />
                        Validate
                      </span>
                    </Button>
                  </div>
                  {errorText(form.formState.errors.mapsUrl?.message)}
                  {mapsUrl ? (
                    <div className="mt-5 overflow-hidden rounded-[24px] bg-[#E5E7EB]">
                      <div className="relative h-[190px] w-full bg-gradient-to-br from-black/30 via-black/10 to-black/30">
                        <div className="absolute inset-0 opacity-60">
                          <div className="absolute left-[18%] top-[32%] h-10 w-10 rounded-full bg-white/20" />
                          <div className="absolute left-[64%] top-[28%] h-8 w-8 rounded-full bg-white/20" />
                          <div className="absolute left-[48%] top-[58%] h-7 w-7 rounded-full bg-white/15" />
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <Button
                            type="button"
                            onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')}
                            className="h-10 rounded-full bg-black/70 px-4 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-black/80"
                          >
                            <span className="inline-flex items-center gap-2">
                              <TargetIcon className="h-4 w-4" />
                              Preview Location
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}
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
                <ComplianceIcon className="h-5 w-5 text-black" />
                <h2 className="text-[20px] font-bold leading-7 text-black">Compliance Documents</h2>
              </div>
              <p className="text-sm text-zinc-600">
                Business PAN on file: <span className="font-semibold text-zinc-900">{pan || '—'}</span>
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {DOC_SLOTS.map((slot) => (
                  <DocUpload key={slot.name} slot={slot} onFile={bindFile(slot.name)} />
                ))}
              </div>
              <UploadQueue
                items={uploads}
                onRemove={(id) => setUploads((prev) => prev.filter((p) => p.id !== id))}
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
                    placeholder="Google Business profile URL"
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

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-base font-extrabold text-primary hover:brightness-95"
          aria-label="Back to Business Info"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path
              d="M15 18l-6-6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Business Info
        </button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={continueLocation}
            className="h-14 rounded-full bg-[#323534] px-10 text-base font-bold text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.35)] hover:brightness-95"
          >
            Skip for Now
          </button>
          <Button
            type="button"
            size="lg"
            className="h-14 rounded-full bg-gradient-to-r from-primary to-[#E91E8C] px-12 text-lg font-extrabold shadow-[0_15px_30px_-8px_rgba(241,30,105,0.45)] hover:brightness-95"
            onClick={continueLocation}
          >
            Continue to Step 3
          </Button>
        </div>
      </div>
    </div>
  );
}
