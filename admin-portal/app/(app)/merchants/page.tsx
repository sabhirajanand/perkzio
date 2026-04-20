import Card from '@/components/ui/card';
import MerchantsPageClient from '@/components/merchants/MerchantsPageClient';
import Input from '@/components/ui/input';
import { AdminPermissions } from '@/lib/constants/permissions';
import { hasPermission } from '@/lib/permissions/hasPermission';
import { readServerSession } from '@/lib/session/readServerSession';
import { Search } from 'lucide-react';

const PAGE_SIZE = 10;

export default async function MerchantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; planCode?: string; createdFrom?: string; createdTo?: string; page?: string }>;
}) {
  const session = await readServerSession();
  const canList = hasPermission(session, AdminPermissions.MERCHANTS_LIST);
  const canView = hasPermission(session, AdminPermissions.MERCHANTS_VIEW);
  const canEdit = hasPermission(session, AdminPermissions.MERCHANTS_EDIT);
  const canDelete = hasPermission(session, AdminPermissions.MERCHANTS_DELETE);
  if (!canList) {
    return (
      <Card className="rounded-[32px] p-6">
        <p className="text-sm font-semibold text-zinc-900">You do not have permission to view merchants.</p>
      </Card>
    );
  }

  const sp = await searchParams;
  const q = typeof sp.q === 'string' && sp.q.trim() ? sp.q.trim() : null;
  const status = typeof sp.status === 'string' && sp.status.trim() ? sp.status.trim() : null;
  const planCode = typeof sp.planCode === 'string' && sp.planCode.trim() ? sp.planCode.trim() : null;
  const createdFrom = typeof sp.createdFrom === 'string' && sp.createdFrom.trim() ? sp.createdFrom.trim() : null;
  const createdTo = typeof sp.createdTo === 'string' && sp.createdTo.trim() ? sp.createdTo.trim() : null;
  const pageRaw = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Merchants</h1>
        <p className="mt-2 text-sm text-zinc-600">All onboarded merchants across the platform.</p>
      </div>

      <Card className="rounded-[32px] p-6">
        <form method="get" action="/merchants" className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input type="hidden" name="page" value="1" />
          <div className="min-w-0 flex-1">
            <Input
              name="q"
              defaultValue={q ?? ''}
              placeholder="Search by name or email"
              leadingIcon={<Search className="h-5 w-5 text-zinc-600" strokeWidth={2} aria-hidden />}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              name="status"
              defaultValue={status ?? ''}
              className="h-[55px] rounded-full bg-[#F3F4F6] px-6 text-sm font-semibold text-zinc-800 outline-none ring-0 focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
            <select
              name="planCode"
              defaultValue={planCode ?? ''}
              className="h-[55px] rounded-full bg-[#F3F4F6] px-6 text-sm font-semibold text-zinc-800 outline-none ring-0 focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All plans</option>
              <option value="LITE">LITE</option>
              <option value="GROWTH">GROWTH</option>
              <option value="PRO">PRO</option>
            </select>
            <input
              type="date"
              name="createdFrom"
              defaultValue={createdFrom ?? ''}
              className="h-[55px] rounded-full bg-[#F3F4F6] px-6 text-sm font-semibold text-zinc-800 outline-none ring-0 focus:ring-2 focus:ring-primary/30"
              aria-label="Created from"
            />
            <input
              type="date"
              name="createdTo"
              defaultValue={createdTo ?? ''}
              className="h-[55px] rounded-full bg-[#F3F4F6] px-6 text-sm font-semibold text-zinc-800 outline-none ring-0 focus:ring-2 focus:ring-primary/30"
              aria-label="Created to"
            />
            <button
              type="submit"
              className="h-[55px] rounded-full bg-gradient-to-r from-[#F11E69] to-[#FF4FA3] px-10 text-sm font-bold text-white shadow-[0_10px_40px_-10px_rgba(241,30,105,0.4)] transition hover:brightness-95"
            >
              Search
            </button>
          </div>
        </form>
      </Card>

      <MerchantsPageClient
        q={q}
        status={status}
        planCode={planCode}
        createdFrom={createdFrom}
        createdTo={createdTo}
        page={page}
        pageSize={PAGE_SIZE}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  );
}

