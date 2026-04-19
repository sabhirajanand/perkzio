import Image from 'next/image';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileUp,
  Search,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

import { cn } from '@/lib/utils/cn';

const COMMUNITY_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuASdZpHbdmUFSmGWhDOxTiWfvW9NBVIJXO7nTvsEIw5qaJgTJzRDDKxt611yPTv3u25exQX_Rw3SlHSeDlFZJaLjfQCF9Pr126oU8oO4GD53HX8ZTPqc429FbDQfTI2TPMgy4TA6V3G3R9mJ1PkK3nY86lrhBaF57g8tNV-Y6yBiC0GWV-KXGVOtstNfVM6Bz83lHPr5o6m5jV-PAmZTYPab8d862yep-qJczvp6qpmuhCoJxbf7YmWS8eMsnPA4gtlzEcPPYy5VDEz';

const TICKETS = [
  {
    id: '#PZ-8892',
    subject: 'Loyalty points not syncing at Downtown branch',
    category: 'Technical' as const,
    status: 'Pending' as const,
    statusTone: 'amber' as const,
    updated: '2 hours ago',
  },
  {
    id: '#PZ-8871',
    subject: 'Request for API documentation for v3.2',
    category: 'Developers' as const,
    status: 'Resolved' as const,
    statusTone: 'green' as const,
    updated: '1 day ago',
  },
  {
    id: '#PZ-8845',
    subject: 'Billing issue: Double charge on premium plan',
    category: 'Billing' as const,
    status: 'Open' as const,
    statusTone: 'blue' as const,
    updated: '3 days ago',
  },
];

function CategoryPill({ category }: { category: 'Technical' | 'Developers' | 'Billing' }) {
  const styles = {
    Technical: 'bg-[#D8E2FF] text-[#004493]',
    Developers: 'bg-[#FFD9E4] text-[#8d0051]',
    Billing: 'bg-[#FFD9DE] text-[#900039]',
  };
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase',
        styles[category],
      )}
    >
      {category === 'Developers' ? 'Developers' : category}
    </span>
  );
}

function StatusCell({ status, tone }: { status: string; tone: 'amber' | 'green' | 'blue' }) {
  const dot = { amber: 'bg-amber-500', green: 'bg-green-500', blue: 'bg-blue-500' }[tone];
  const text = { amber: 'text-amber-600', green: 'text-green-600', blue: 'text-blue-600' }[tone];
  return (
    <div className="flex items-center gap-2">
      <span className={cn('h-2 w-2 shrink-0 rounded-full', dot)} aria-hidden />
      <span className={cn('text-xs font-bold uppercase', text)}>{status}</span>
    </div>
  );
}

export default function SupportWorkspace() {
  return (
    <div className="text-[#191c1b]">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="font-headline text-4xl font-semibold leading-none tracking-tight text-[#333235] md:text-5xl md:leading-none">
            Support
          </h1>
          <p className="max-w-3xl text-lg font-medium leading-7 text-[#4B5563]">
            Create a ticket or follow up on an existing conversation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 space-y-10 lg:col-span-8">
          <section className="overflow-hidden rounded-[2rem] bg-white shadow-[0_25px_50px_-12px_rgba(236,72,153,0.05)]">
            <div className="flex flex-col justify-between gap-4 border-b border-[#F2F4F2] p-8 sm:flex-row sm:items-center">
              <h2 className="font-headline text-xl font-bold text-slate-900">Recent Activity</h2>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#F2F4F2] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-600">
                  Filter By: Status
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-white">
                    <th className="px-8 py-5 font-headline text-xs font-black uppercase tracking-wider text-slate-400">
                      Ticket ID
                    </th>
                    <th className="px-8 py-5 font-headline text-xs font-black uppercase tracking-wider text-slate-400">
                      Subject
                    </th>
                    <th className="px-8 py-5 font-headline text-xs font-black uppercase tracking-wider text-slate-400">
                      Category
                    </th>
                    <th className="px-8 py-5 font-headline text-xs font-black uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                    <th className="px-8 py-5 text-right font-headline text-xs font-black uppercase tracking-wider text-slate-400">
                      Last Update
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F4F2]">
                  {TICKETS.map((row) => (
                    <tr
                      key={row.id}
                      className="group cursor-pointer transition-colors hover:bg-white"
                    >
                      <td className="px-8 py-6 text-sm font-bold text-slate-900">{row.id}</td>
                      <td className="px-8 py-6 text-sm font-medium text-slate-700">{row.subject}</td>
                      <td className="px-8 py-6">
                        <CategoryPill category={row.category} />
                      </td>
                      <td className="px-8 py-6">
                        <StatusCell status={row.status} tone={row.statusTone} />
                      </td>
                      <td className="px-8 py-6 text-right text-sm text-slate-400">{row.updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-10 shadow-[0_25px_50px_-12px_rgba(236,72,153,0.05)]">
            <div className="mb-10">
              <h2 className="mb-2 font-headline text-2xl font-bold text-slate-900">Raise a New Issue</h2>
              <p className="text-sm text-[#5c3f44]">Need immediate help? Fill out the details below.</p>
            </div>
            <form className="space-y-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="ml-2 text-xs font-black uppercase tracking-widest text-slate-400">
                    Support Category
                  </label>
                  <div className="relative">
                    <select className="w-full appearance-none rounded-xl border-0 bg-[#F2F4F2] px-6 py-4 pr-12 text-sm font-medium text-slate-700 outline-none ring-0 focus:ring-2 focus:ring-[#b8004b]/20">
                      <option>Technical Issue</option>
                      <option>Billing &amp; Subscription</option>
                      <option>Marketing &amp; Loyalty</option>
                      <option>API &amp; Integration</option>
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="ml-2 text-xs font-black uppercase tracking-widest text-slate-400">
                    Branch Location
                  </label>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <input
                      type="text"
                      readOnly
                      placeholder="Select branch..."
                      className="w-full rounded-xl border-0 bg-[#F2F4F2] px-6 py-4 pr-12 text-sm font-medium text-slate-700 outline-none ring-0 focus:ring-2 focus:ring-[#b8004b]/20"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="ml-2 text-xs font-black uppercase tracking-widest text-slate-400">
                  Subject Line
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="Brief summary of the issue"
                  className="w-full rounded-xl border-0 bg-[#F2F4F2] px-6 py-4 text-sm font-medium text-slate-700 outline-none ring-0 focus:ring-2 focus:ring-[#b8004b]/20"
                />
              </div>
              <div className="space-y-2">
                <label className="ml-2 text-xs font-black uppercase tracking-widest text-slate-400">
                  Detailed Description
                </label>
                <textarea
                  readOnly
                  rows={5}
                  placeholder="Tell us exactly what happened..."
                  className="w-full resize-none rounded-xl border-0 bg-[#F2F4F2] px-6 py-4 text-sm font-medium text-slate-700 outline-none ring-0 focus:ring-2 focus:ring-[#b8004b]/20"
                />
              </div>
              <div className="space-y-2">
                <label className="ml-2 text-xs font-black uppercase tracking-widest text-slate-400">
                  Attachments (Optional)
                </label>
                <button
                  type="button"
                  className="group w-full cursor-pointer rounded-[2rem] border-2 border-dashed border-[#E4BDC2]/30 bg-white p-12 text-center transition-colors hover:border-[#b8004b]/50"
                >
                  <FileUp
                    className="mx-auto mb-3 block h-10 w-10 text-slate-300 transition-colors group-hover:text-[#b8004b]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <p className="text-sm font-bold text-slate-600">
                    Drag &amp; drop files here or <span className="text-[#b8004b] underline">browse</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-400">PNG, JPG, PDF up to 10MB</p>
                </button>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  className="rounded-full bg-gradient-to-r from-[#F11E69] to-[#FF4FA3] px-12 py-4 text-sm font-bold text-white shadow-[0_8px_32px_rgba(241,30,105,0.3)] transition-all hover:scale-[1.02] active:scale-95"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </section>
        </div>

        <div className="col-span-12 space-y-10 lg:col-span-4">
          <div className="relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-[0_25px_50px_-12px_rgba(236,72,153,0.05)]">
            <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-[#F11E69]/10 to-transparent" aria-hidden />
            <div className="relative mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-[#F11E69]">
                <ShieldCheck className="h-6 w-6" strokeWidth={2} aria-hidden />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Support Plan</h3>
                <p className="font-headline text-2xl font-black text-slate-900">Growth Tier</p>
              </div>
            </div>
            <div className="relative space-y-6">
              <div className="rounded-2xl bg-[#F2F4F2] p-5">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Expected Response Time</p>
                <p className="text-xl font-bold text-slate-800">Under 24 Hours</p>
              </div>
              <div className="flex items-center gap-4 px-2 text-sm font-medium text-slate-600">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" strokeWidth={2} aria-hidden />
                <span>Dedicated Account Manager</span>
              </div>
              <div className="flex items-center gap-4 px-2 text-sm font-medium text-slate-600">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" strokeWidth={2} aria-hidden />
                <span>Live Chat (Mon - Fri)</span>
              </div>
              <button
                type="button"
                className="w-full rounded-full border-2 border-[#b8004b]/10 py-4 text-sm font-bold text-[#b8004b] transition-colors hover:bg-pink-50"
              >
                Upgrade My Support Tier
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-[0_25px_50px_-12px_rgba(236,72,153,0.05)]">
            <h3 className="mb-6 font-headline text-lg font-bold text-slate-900">Quick Resources</h3>
            <div className="space-y-3">
              <a
                href="#"
                className="group flex items-center justify-between rounded-2xl bg-[#F2F4F2] p-4 transition-all hover:bg-[#E7E9E7]"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-slate-400 transition-colors group-hover:text-[#b8004b]" strokeWidth={2} aria-hidden />
                  <span className="text-sm font-bold text-slate-700">Subscription &amp; Billing</span>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1" strokeWidth={2} aria-hidden />
              </a>
              <a
                href="#"
                className="group flex items-center justify-between rounded-2xl bg-[#F2F4F2] p-4 transition-all hover:bg-[#E7E9E7]"
              >
                <div className="flex items-center gap-3">
                  <Terminal className="h-5 w-5 text-slate-400 transition-colors group-hover:text-[#b8004b]" strokeWidth={2} aria-hidden />
                  <span className="text-sm font-bold text-slate-700">API Documentation</span>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1" strokeWidth={2} aria-hidden />
              </a>
              <a
                href="#"
                className="group flex items-center justify-between rounded-2xl bg-[#F2F4F2] p-4 transition-all hover:bg-[#E7E9E7]"
              >
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-slate-400 transition-colors group-hover:text-[#b8004b]" strokeWidth={2} aria-hidden />
                  <span className="text-sm font-bold text-slate-700">Platform Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" aria-hidden />
                  <span className="text-[10px] font-black uppercase text-green-600">Online</span>
                </div>
              </a>
            </div>
          </div>

          <div className="group relative h-64 overflow-hidden rounded-[2rem]">
            <Image
              src={COMMUNITY_IMG}
              alt="Merchant community"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#F11E69]/90 to-transparent p-8">
              <h4 className="mb-1 font-headline text-xl font-bold text-white">Merchant Academy</h4>
              <p className="mb-4 text-sm text-white/80">Learn how to maximize your loyalty program performance.</p>
              <a
                href="#"
                className="group/link flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white"
              >
                Watch Tutorials
                <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" strokeWidth={2} aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-10 text-center text-xs font-medium text-slate-500">
        Preview: static layout from design — wire ticket APIs when ready.
      </p>
    </div>
  );
}
