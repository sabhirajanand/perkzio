'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';

export interface ImageUploadProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  kind: 'inside' | 'outside' | 'logo';
  variant?: 'tile' | 'flat';
  showAction?: boolean;
  deferUpload?: boolean;
  onSelectedFile?: (file: File) => void;
  valueUrl: string;
  fileName: string;
  onUploaded: (out: { url: string; key: string; fileName: string }) => void;
  onProgress?: (item: { id: string; fileName: string; progress: number }) => void;
}

export default function ImageUpload({
  title,
  description,
  icon,
  kind,
  variant = 'tile',
  showAction = true,
  deferUpload = false,
  onSelectedFile,
  valueUrl,
  fileName,
  onUploaded,
  onProgress,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function upload(file: File) {
    const id = `${kind}:${file.name}`;
    setIsUploading(true);
    onProgress?.({ id, fileName: file.name, progress: 10 });
    try {
      if (deferUpload) {
        onSelectedFile?.(file);
        onProgress?.({ id, fileName: file.name, progress: 100 });
        onUploaded({ url: '', key: '', fileName: file.name });
        return;
      }
      const form = new FormData();
      form.append('file', file);
      form.append('kind', kind);
      onProgress?.({ id, fileName: file.name, progress: 35 });
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const body = (await res.json().catch(() => null)) as
        | { success?: boolean; data?: { url?: string; key?: string }; message?: string }
        | null;
      if (!res.ok || !body?.data?.url || !body.data.key) {
        throw new Error(body?.message || 'Upload failed');
      }
      onProgress?.({ id, fileName: file.name, progress: 100 });
      onUploaded({ url: body.data.url, key: body.data.key, fileName: file.name });
      toast.success('Uploaded');
    } catch (e) {
      onProgress?.({ id, fileName: file.name, progress: 0 });
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded-[18px]">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          void upload(f);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          variant === 'flat'
            ? 'flex w-full items-center gap-4 rounded-[18px] border-2 border-dashed border-[#FFB2BF] bg-[#F9FAFB] px-5 py-4 text-left'
            : 'flex w-full flex-col items-center justify-center gap-3 rounded-[18px] border-2 border-dashed border-[#FFB2BF] bg-[#F9FAFB] px-6 py-8 text-center',
          isUploading ? 'opacity-70' : 'hover:bg-white',
        )}
      >
        <span
          className={cn(
            'flex items-center justify-center text-black [&_svg]:h-10 [&_svg]:w-10',
            variant === 'flat' ? 'h-12 w-12 shrink-0 rounded-full bg-[#FFB2BF]/25' : 'h-12 w-12',
          )}
        >
          {icon}
        </span>
        <div className={cn('space-y-2', variant === 'flat' ? 'min-w-0 flex-1 space-y-1' : '')}>
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-black">{title}</p>
          <p className={cn('text-xs leading-relaxed text-zinc-600', variant === 'flat' ? 'max-w-none' : 'max-w-[240px]')}>
            {description}
          </p>
          {variant === 'flat' ? (
            <p className="truncate text-xs font-semibold text-zinc-500">{valueUrl ? fileName : 'PNG, JPG up to 5MB'}</p>
          ) : null}
        </div>
        {variant === 'flat' ? (
          showAction ? (
            <span className="shrink-0 rounded-full bg-[#F3F4F6] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-zinc-900">
              {isUploading ? 'Uploading' : 'Upload'}
            </span>
          ) : null
        ) : valueUrl ? (
          <span className="mt-1 text-xs font-semibold text-primary">{fileName}</span>
        ) : (
          <span className="mt-1 text-xs font-semibold text-zinc-500">PNG, JPG up to 5MB</span>
        )}
      </button>
    </div>
  );
}

