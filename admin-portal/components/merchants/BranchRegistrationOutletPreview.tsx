import Image from 'next/image';

type OpeningHourRow = { day: string; open: boolean; from: string; to: string };

function readStr(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v : null;
}

function parseOpeningHours(payload: Record<string, unknown> | null): OpeningHourRow[] {
  const raw = payload?.openingHours;
  if (!Array.isArray(raw)) return [];
  const out: OpeningHourRow[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const o = row as Record<string, unknown>;
    const day = typeof o.day === 'string' ? o.day : '';
    if (!day) continue;
    out.push({
      day,
      open: typeof o.open === 'boolean' ? o.open : false,
      from: typeof o.from === 'string' ? o.from : '',
      to: typeof o.to === 'string' ? o.to : '',
    });
  }
  return out;
}

function PhotoTile({ title, imageUrl, storageKey }: { title: string; imageUrl: string | null; storageKey: string | null }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm ring-1 ring-black/5">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{title}</p>
      {imageUrl ? (
        <a
          href={imageUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-black/5"
        >
          <Image src={imageUrl} alt={title} width={960} height={384} className="h-48 w-full object-cover" unoptimized />
        </a>
      ) : (
        <p className="mt-3 text-sm text-zinc-600">
          {storageKey ? `No public URL on file. Storage key: ${storageKey}` : 'No image uploaded.'}
        </p>
      )}
      {imageUrl ? (
        <a className="mt-2 inline-block text-xs font-semibold text-primary hover:underline" href={imageUrl} target="_blank" rel="noreferrer">
          Open full size
        </a>
      ) : null}
    </div>
  );
}

export interface BranchRegistrationOutletPreviewProps {
  payload: Record<string, unknown> | null;
}

export default function BranchRegistrationOutletPreview({ payload }: BranchRegistrationOutletPreviewProps) {
  const hours = parseOpeningHours(payload);
  const insideUrl = payload ? readStr(payload.insideViewUrl) : null;
  const outsideUrl = payload ? readStr(payload.outsideViewUrl) : null;
  const insideKey = payload ? readStr(payload.insideViewKey) : null;
  const outsideKey = payload ? readStr(payload.outsideViewKey) : null;

  return (
    <div className="space-y-8 sm:col-span-2">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Operating hours</p>
        {hours.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">No hours submitted.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-black/10">
            <table className="w-full min-w-[360px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-zinc-50">
                  <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-500">Day</th>
                  <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                  <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-500">Hours</th>
                </tr>
              </thead>
              <tbody>
                {hours.map((h, idx) => (
                  <tr key={h.day} className={idx > 0 ? 'border-t border-black/5' : ''}>
                    <td className="px-4 py-2.5 font-semibold text-zinc-900">{h.day}</td>
                    <td className="px-4 py-2.5 text-zinc-700">{h.open ? 'Open' : 'Closed'}</td>
                    <td className="px-4 py-2.5 text-zinc-700">{h.open ? `${h.from} – ${h.to}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Branch photos</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <PhotoTile title="Inside view" imageUrl={insideUrl} storageKey={insideKey} />
          <PhotoTile title="Outside view" imageUrl={outsideUrl} storageKey={outsideKey} />
        </div>
      </div>
    </div>
  );
}
