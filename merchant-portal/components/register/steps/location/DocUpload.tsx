import { useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import type { RegisterApplicationInput } from '@/lib/schemas/register';

export interface DocUploadSlot {
  name: keyof Pick<
    RegisterApplicationInput,
    'gstCertFileName' | 'panCardFileName' | 'addressProofFileName' | 'shopPhotoFileName'
  >;
  title: string;
  hint: string;
  icon: React.ReactNode;
}

export interface DocUploadProps {
  slot: DocUploadSlot;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DocUpload({ slot, onFile }: DocUploadProps) {
  const ref = useRef<HTMLInputElement>(null);
  const { watch } = useFormContext<RegisterApplicationInput>();
  const value = watch(slot.name);

  return (
    <div className="rounded-[10px]">
      <input ref={ref} type="file" className="hidden" accept="image/*,.pdf" onChange={onFile} />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-3 rounded-[10px] border-2 border-dashed border-[#FFB2BF] bg-[#F3F4F6] px-4 py-7 text-center"
      >
        <span className="flex h-[45px] w-[45px] items-center justify-center text-black [&_svg]:h-[45px] [&_svg]:w-[45px]">
          {slot.icon}
        </span>
        <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-black">{slot.title}</span>
        <span className="max-w-[180px] text-xs leading-relaxed text-zinc-600">{slot.hint}</span>
        {value ? <span className="mt-1 text-xs font-semibold text-primary">{value}</span> : null}
      </button>
    </div>
  );
}

