import { CalendarRange, ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';

import Input from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

const REDEMPTION_ROWS = [
  {
    initials: 'HE',
    name: 'Helena Echeverria',
    email: 'helena.e@architect.com',
    offer: '50% Off Obsidian Latte',
    date: 'Oct 24, 2023',
    time: '14:32:05',
    branch: 'Core Downtown',
    staffId: '#STF-9921',
    status: 'Success',
  },
  {
    initials: 'HE',
    name: 'Helena Echeverria',
    email: 'helena.e@architect.com',
    offer: '50% Off Obsidian Latte',
    date: 'Oct 24, 2023',
    time: '14:32:05',
    branch: 'Core Downtown',
    staffId: '#STF-9921',
    status: 'Success',
  },
  {
    initials: 'HE',
    name: 'Helena Echeverria',
    email: 'helena.e@architect.com',
    offer: '50% Off Obsidian Latte',
    date: 'Oct 24, 2023',
    time: '14:32:05',
    branch: 'Core Downtown',
    staffId: '#STF-9921',
    status: 'Success',
  },
  {
    initials: 'HE',
    name: 'Helena Echeverria',
    email: 'helena.e@architect.com',
    offer: '50% Off Obsidian Latte',
    date: 'Oct 24, 2023',
    time: '14:32:05',
    branch: 'Core Downtown',
    staffId: '#STF-9921',
    status: 'Success',
  },
  {
    initials: 'HE',
    name: 'Helena Echeverria',
    email: 'helena.e@architect.com',
    offer: '50% Off Obsidian Latte',
    date: 'Oct 24, 2023',
    time: '14:32:05',
    branch: 'Core Downtown',
    staffId: '#STF-9921',
    status: 'Success',
  },
  {
    initials: 'HE',
    name: 'Helena Echeverria',
    email: 'helena.e@architect.com',
    offer: '50% Off Obsidian Latte',
    date: 'Oct 24, 2023',
    time: '14:32:05',
    branch: 'Core Downtown',
    staffId: '#STF-9921',
    status: 'Success',
  },
  {
    initials: 'HE',
    name: 'Helena Echeverria',
    email: 'helena.e@architect.com',
    offer: '50% Off Obsidian Latte',
    date: 'Oct 24, 2023',
    time: '14:32:05',
    branch: 'Core Downtown',
    staffId: '#STF-9921',
    status: 'Success',
  },
  {
    initials: 'HE',
    name: 'Helena Echeverria',
    email: 'helena.e@architect.com',
    offer: '50% Off Obsidian Latte',
    date: 'Oct 24, 2023',
    time: '14:32:05',
    branch: 'Core Downtown',
    staffId: '#STF-9921',
    status: 'Success',
  },
  {
    initials: 'HE',
    name: 'Helena Echeverria',
    email: 'helena.e@architect.com',
    offer: '50% Off Obsidian Latte',
    date: 'Oct 24, 2023',
    time: '14:32:05',
    branch: 'Core Downtown',
    staffId: '#STF-9921',
    status: 'Success',
  },
  {
    initials: 'HE',
    name: 'Helena Echeverria',
    email: 'helena.e@architect.com',
    offer: '50% Off Obsidian Latte',
    date: 'Oct 24, 2023',
    time: '14:32:05',
    branch: 'Core Downtown',
    staffId: '#STF-9921',
    status: 'Success',
  },
  {
    initials: 'HE',
    name: 'Helena Echeverria',
    email: 'helena.e@architect.com',
    offer: '50% Off Obsidian Latte',
    date: 'Oct 24, 2023',
    time: '14:32:05',
    branch: 'Core Downtown',
    staffId: '#STF-9921',
    status: 'Success',
  },
] as const;

function StatusPill({ status }: { status: string }) {
  const ok = status === 'Success';
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
        ok ? 'bg-emerald-50 text-emerald-800' : 'bg-zinc-100 text-zinc-700',
      )}
    >
      {status}
    </span>
  );
}

export default function CampaignsWorkspace() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="font-headline text-4xl font-semibold leading-none tracking-tight text-[#333235] md:text-5xl md:leading-none">
            Redemption History
          </h1>
          <p className="max-w-3xl text-lg font-medium leading-7 text-[#4B5563]">
            Monitor and manage all claimed rewards across your branches.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#F11E69] to-[#FF4FA3] px-8 text-base font-bold text-white shadow-[0_10px_40px_-10px_rgba(241,30,105,0.4)] transition hover:brightness-95"
        >
          <Download className="h-5 w-5" strokeWidth={2} aria-hidden />
          Download CSV
        </button>
      </div>

      <div className="rounded-[24px] border border-[#B3B1B4]/10 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="min-w-0 xl:col-span-1">
            <Input
              readOnly
              defaultValue=""
              placeholder="Search by name..."
              leadingIcon={<Search className="h-5 w-5 text-[#605E61]" strokeWidth={2} aria-hidden />}
            />
          </div>
          <button
            type="button"
            className="flex h-[55px] items-center justify-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-5 text-sm font-semibold text-[#333235]"
          >
            <CalendarRange className="h-5 w-5 text-[#605E61]" strokeWidth={2} aria-hidden />
            Oct 01 - Oct 31, 2023
          </button>
          <button
            type="button"
            className="h-[55px] rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-6 text-left text-sm font-semibold text-[#333235]"
          >
            All Branches
          </button>
          <button
            type="button"
            className="h-[55px] rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-6 text-left text-sm font-semibold text-[#333235]"
          >
            All Statuses
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#B3B1B4]/10 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="border-b border-[#FFFBF0] bg-[#FFFBF0] px-8 py-3 text-center text-xs font-semibold text-amber-900/90">
          Preview: sample data for layout &amp; UX — replace with live redemptions when connected.
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse">
            <thead>
              <tr className="border-b border-[#B3B1B4]/10 bg-[#F6F3F4]/50">
                {(['Customer Name', 'Offer Title', 'Timestamp', 'Branch', 'Staff ID', 'Status'] as const).map((h) => (
                  <th
                    key={h}
                    className="px-8 py-5 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REDEMPTION_ROWS.map((row, idx) => (
                <tr key={row.email} className={idx > 0 ? 'border-t border-[#B3B1B4]/10' : ''}>
                  <td className="px-8 py-6 align-middle">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D1DDFA] text-sm font-bold text-[#434E66]"
                        aria-hidden
                      >
                        {row.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold text-[#333235]">{row.name}</p>
                        <p className="truncate text-sm text-[#605E61]">{row.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-[#333235]">{row.offer}</td>
                  <td className="px-8 py-6 text-sm text-[#333235]">
                    {row.date}
                    <br />
                    <span className="text-[#605E61]">{row.time}</span>
                  </td>
                  <td className="px-8 py-6 text-sm text-[#333235]">{row.branch}</td>
                  <td className="px-8 py-6 text-sm font-mono text-[#605E61]">{row.staffId}</td>
                  <td className="px-8 py-6">
                    <StatusPill status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#B3B1B4]/10 bg-[#FAFAFA]/80 px-6 py-5 sm:px-8">
          <div className="flex flex-col items-stretch gap-5 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-center text-sm font-medium text-[#605E61] lg:text-left">
              Showing <span className="text-[#333235]">1–10</span> of{' '}
              <span className="text-[#333235]">248</span> staff members
            </p>
            <nav className="flex flex-wrap items-center justify-center gap-2 lg:justify-end" aria-label="Pagination">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#B3B1B4]/25 bg-white text-[#333235] shadow-sm">
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#F11E69] to-[#FF4FA3] text-sm font-bold text-white shadow-sm">
                1
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#B3B1B4]/25 bg-white text-sm font-semibold text-[#333235] shadow-sm">
                2
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#B3B1B4]/25 bg-white text-sm font-semibold text-[#333235] shadow-sm">
                3
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-zinc-300">
                <ChevronRight className="h-5 w-5" strokeWidth={2} />
              </span>
            </nav>
          </div>
        </div>
      </div>

      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5"
        aria-label="Redemption insights"
      >
        <div className="rounded-[24px] border border-[#B3B1B4]/10 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)] lg:col-span-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#605E61]">Total Value Redeemed</p>
          <p className="mt-2 font-headline text-3xl font-bold tracking-tight text-[#333235] md:text-4xl">$12,482.00</p>
          <p className="mt-2 text-sm font-semibold text-emerald-600">+14.2% from last month</p>
        </div>
        <div className="rounded-[24px] border border-[#B3B1B4]/10 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)] lg:col-span-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#605E61]">Peak Activity Branch</p>
          <p className="mt-2 font-headline text-2xl font-bold tracking-tight text-[#333235]">Downtown Care</p>
          <p className="mt-2 text-sm text-[#6B7280]">112 Redemptions today</p>
        </div>
        <div className="rounded-[24px] border border-[#B3B1B4]/10 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)] lg:col-span-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#605E61]">Void Rate</p>
          <p className="mt-2 font-headline text-3xl font-bold tracking-tight text-[#333235] md:text-4xl">0.42%</p>
          <p className="mt-2 text-sm text-[#6B7280]">Healthy - Industry Avg 1.2%</p>
        </div>
      </section>
      
    </div>
  );
}
