import { MapPin, Store } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

import BranchRequestForm from './BranchRequestForm';
import type { BranchRequestRow, BranchesListDto, BranchRow } from './types';

export type { BranchesListDto, BranchRow, BranchRequestRow } from './types';

interface BranchesWorkspaceProps {
  data: BranchesListDto | null;
  loadFailed: boolean;
  branchRequests: BranchRequestRow[];
  requestsLoadFailed: boolean;
}

function formatAddress(addr: Record<string, unknown> | null): string {
  if (!addr || typeof addr !== 'object') return '—';
  const city = typeof addr.city === 'string' ? addr.city : '';
  const state = typeof addr.state === 'string' ? addr.state : '';
  const line1 = typeof addr.line1 === 'string' ? addr.line1 : '';
  const parts = [line1, [city, state].filter(Boolean).join(', ')].filter(Boolean);
  return parts.length ? parts.join(' · ') : '—';
}

function requestStatusClass(status: string) {
  if (status === 'PENDING') return 'bg-amber-50 text-amber-900';
  if (status === 'APPROVED') return 'bg-emerald-50 text-emerald-800';
  if (status === 'REJECTED') return 'bg-red-50 text-red-800';
  return 'bg-zinc-100 text-zinc-700';
}

export default function BranchesWorkspace({
  data,
  loadFailed,
  branchRequests,
  requestsLoadFailed,
}: BranchesWorkspaceProps) {
  const subtitle = data
    ? `You have ${data.branches.length} branch${data.branches.length === 1 ? '' : 'es'} on your account.`
    : 'Open locations, assign branch admins, and keep access aligned with your operations.';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="font-headline text-4xl font-semibold leading-none tracking-tight text-[#333235] md:text-5xl md:leading-none">
            Branches
          </h1>
          <p className="max-w-3xl text-lg font-medium leading-7 text-[#4B5563]">{subtitle}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#B3B1B4]/10 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        {!data ? (
          <div className="p-10 text-center text-sm text-[#605E61]">
            {loadFailed
              ? 'Unable to load branches. Check your connection and try again.'
              : 'Unable to load branches.'}
          </div>
        ) : (
          <>
            <div className="border-b border-[#FFFBF0] bg-[#FFFBF0] px-6 py-3 text-center text-xs font-semibold text-amber-900/90 sm:px-8">
              New branches and branch admins are activated only after platform admin approval. Your head branch was
              created at onboarding.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="border-b border-[#B3B1B4]/10 bg-[#F6F3F4]/50">
                    <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Branch
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Location
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Type
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Branch admin
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.branches.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-10 text-center text-sm text-[#605E61]">
                        No branches found.
                      </td>
                    </tr>
                  ) : (
                    data.branches.map((b, idx) => (
                      <tr key={b.id} className={idx > 0 ? 'border-t border-[#B3B1B4]/10' : ''}>
                        <td className="px-8 py-6 align-middle">
                          <div className="flex items-center gap-4">
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D1DDFA] text-[#434E66]"
                              aria-hidden
                            >
                              <Store className="h-5 w-5" strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-base font-bold text-[#333235]">{b.name}</p>
                              <p className="truncate text-xs text-[#605E61]">
                                Added {new Date(b.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-[240px] px-8 py-6 align-middle">
                          <div className="flex items-start gap-2 text-sm text-[#333235]">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#605E61]" strokeWidth={2} aria-hidden />
                            <span className="line-clamp-2">{formatAddress(b.address)}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 align-middle">
                          {b.isHeadBranch ? (
                            <span className="inline-flex rounded-full bg-[#F0EDEF] px-3 py-1 text-xs font-bold text-[#525155]">
                              Head branch
                            </span>
                          ) : (
                            <span className="text-sm text-[#605E61]">Location</span>
                          )}
                        </td>
                        <td className="px-8 py-6 align-middle text-sm text-[#333235]">
                          {b.branchAdminEmail ?? <span className="text-[#605E61]">—</span>}
                        </td>
                        <td className="px-8 py-6 align-middle">
                          <span
                            className={cn(
                              'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                              b.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800' : 'bg-zinc-100 text-zinc-700',
                            )}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {data?.viewerRole === 'MERCHANT_ADMIN' ? (
        <div className="overflow-hidden rounded-[24px] border border-[#B3B1B4]/10 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="border-b border-[#B3B1B4]/10 px-6 py-5 sm:px-8">
            <h2 className="font-headline text-lg font-bold text-[#333235]">Branch requests</h2>
            <p className="mt-1 text-sm text-[#605E61]">
              Track submissions to add a location. The proposed branch admin can sign in only after approval.
            </p>
          </div>
          {requestsLoadFailed ? (
            <div className="px-6 py-8 text-sm text-red-600 sm:px-8">Unable to load branch requests.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr className="border-b border-[#B3B1B4]/10 bg-[#F6F3F4]/50">
                    <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Branch
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Admin
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Submitted
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#605E61]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {branchRequests.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-10 text-center text-sm text-[#605E61]">
                        No branch requests yet.
                      </td>
                    </tr>
                  ) : (
                    branchRequests.map((r, idx) => (
                      <tr key={r.id} className={idx > 0 ? 'border-t border-[#B3B1B4]/10' : ''}>
                        <td className="px-8 py-5 align-middle">
                          <p className="font-semibold text-[#333235]">{r.branchName}</p>
                          {r.status === 'REJECTED' && r.rejectionReason ? (
                            <p className="mt-1 text-xs text-red-700">{r.rejectionReason}</p>
                          ) : null}
                        </td>
                        <td className="px-8 py-5 align-middle text-sm text-[#333235]">
                          <p>{r.adminName}</p>
                          <p className="text-xs text-[#605E61]">{r.adminEmail}</p>
                        </td>
                        <td className="px-8 py-5 align-middle text-sm text-[#605E61]">
                          {new Date(r.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>
                        <td className="px-8 py-5 align-middle">
                          <span
                            className={cn(
                              'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                              requestStatusClass(r.status),
                            )}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {data?.viewerRole === 'MERCHANT_ADMIN' ? <BranchRequestForm /> : null}
      {data?.viewerRole === 'BRANCH_ADMIN' ? (
        <p className="rounded-[24px] border border-[#B3B1B4]/10 bg-white px-6 py-5 text-sm text-[#605E61] shadow-sm">
          Branch administrators cannot add new branches. Contact your merchant administrator if you need another
          location.
        </p>
      ) : null}
    </div>
  );
}
