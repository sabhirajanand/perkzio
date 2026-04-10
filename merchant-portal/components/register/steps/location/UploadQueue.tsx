import { cn } from '@/lib/utils/cn';

export interface UploadQueueItem {
  id: string;
  fileName: string;
  progress: number;
}

export interface UploadQueueProps {
  items: UploadQueueItem[];
  onRemove: (id: string) => void;
}

export default function UploadQueue({ items, onRemove }: UploadQueueProps) {
  if (items.length === 0) return null;

  return (
    <div className="mt-6 space-y-3 rounded-[16px] bg-[#F3F4F6] p-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFB2BF]/40 text-primary">
            <span className="h-4 w-4 rounded-[3px] bg-current" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-xs font-extrabold uppercase tracking-[0.12em] text-black">
                {item.fileName}
              </p>
              <p className="shrink-0 text-xs font-semibold text-black">{item.progress}%</p>
            </div>
            <div className="mt-2 h-[6px] w-full rounded-full bg-black/10">
              <div
                className={cn('h-[6px] rounded-full bg-black')}
                style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="grid h-9 w-9 place-items-center rounded-full text-zinc-500 hover:bg-black/5 hover:text-zinc-800"
            aria-label="Remove upload"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

