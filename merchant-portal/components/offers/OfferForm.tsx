'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';

export interface OfferFormInitial {
  title: string;
  description: string;
  termsHtml: string;
  validFrom: string;
  validTo: string;
  audienceType: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED';
}

export interface OfferFormProps {
  mode: 'create' | 'edit';
  offerId?: string;
  initial: OfferFormInitial;
}

export default function OfferForm({ mode, offerId, initial }: OfferFormProps) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [termsHtml, setTermsHtml] = useState(initial.termsHtml);
  const [validFrom, setValidFrom] = useState(initial.validFrom);
  const [validTo, setValidTo] = useState(initial.validTo);
  const [audienceType, setAudienceType] = useState(initial.audienceType);
  const [status, setStatus] = useState<OfferFormInitial['status']>(initial.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (title.trim().length < 2) return toast.error('Title is required');
    if (!validFrom || !validTo) return toast.error('Valid dates are required');

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        termsHtml: termsHtml.trim() ? termsHtml.trim() : null,
        validFrom: new Date(validFrom).toISOString(),
        validTo: new Date(validTo).toISOString(),
        audienceType: audienceType.trim() || 'ALL',
        status,
      };

      const url = mode === 'create' ? '/api/merchant/offers' : `/api/merchant/offers/${offerId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message || 'Unable to save offer');
      }
      const body = (await res.json().catch(() => null)) as { offerId?: string } | null;
      toast.success(mode === 'create' ? 'Offer created' : 'Offer updated');
      window.location.href = mode === 'create' ? `/offers/${body?.offerId ?? ''}` : `/offers/${offerId}`;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to save offer');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Offer title" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="validFrom">Valid from</Label>
          <Input id="validFrom" type="datetime-local" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="validTo">Valid to</Label>
          <Input id="validTo" type="datetime-local" value={validTo} onChange={(e) => setValidTo(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="audienceType">Audience</Label>
          <select
            id="audienceType"
            value={audienceType}
            onChange={(e) => setAudienceType(e.target.value)}
            className="h-[55px] w-full rounded-full bg-[#F3F4F6] px-6 text-base text-zinc-900 outline-none focus:bg-zinc-50 focus:ring-2 focus:ring-primary/30"
          >
            <option value="ALL">All customers</option>
            <option value="SEGMENT">Segment (coming soon)</option>
            <option value="TARGET_CUSTOMERS">Target customers (coming soon)</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OfferFormInitial['status'])}
            className="h-[55px] w-full rounded-full bg-[#F3F4F6] px-6 text-base text-zinc-900 outline-none focus:bg-zinc-50 focus:ring-2 focus:ring-primary/30"
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-3xl bg-[#F3F4F6] px-6 py-4 text-base text-zinc-900 placeholder:text-zinc-500 outline-none focus:bg-zinc-50 focus:ring-2 focus:ring-primary/30"
          placeholder="Short description"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="termsHtml">Terms & conditions</Label>
        <textarea
          id="termsHtml"
          value={termsHtml}
          onChange={(e) => setTermsHtml(e.target.value)}
          rows={6}
          className="w-full rounded-3xl bg-[#F3F4F6] px-6 py-4 text-base text-zinc-900 placeholder:text-zinc-500 outline-none focus:bg-zinc-50 focus:ring-2 focus:ring-primary/30"
          placeholder="Enter terms (plain text for now)"
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => (window.location.href = '/offers')} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={isSubmitting}>
          {mode === 'create' ? 'Create offer' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}

