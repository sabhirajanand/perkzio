'use client';

import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function InviteCustomersButton() {
  return (
    <button
      type="button"
      className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#4F46E5] px-8 text-base font-semibold text-[#F9FAFF] shadow-[0_8px_24px_-4px_rgba(73,85,179,0.45)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/40"
      onClick={() => toast.message('Invite flow will be available soon.')}
    >
      <UserPlus className="h-4 w-4 opacity-90" strokeWidth={2} aria-hidden />
      Invite Customers
    </button>
  );
}
