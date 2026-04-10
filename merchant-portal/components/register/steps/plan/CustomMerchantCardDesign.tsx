export interface CustomMerchantCardDesignProps {
  priceLabel: string;
  onAdd: () => void;
}

export default function CustomMerchantCardDesign({ priceLabel, onAdd }: CustomMerchantCardDesignProps) {
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-[0_0_28px_rgba(0,0,0,0.10)]">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-[10px] bg-black/80" aria-hidden />
          <div>
            <p className="text-base font-extrabold text-black">Custom Merchant Card Design</p>
            <p className="mt-1 text-sm text-zinc-600">
              Get physical NFC cards with your logo for in-person payments.
            </p>
            <button
              type="button"
              onClick={onAdd}
              className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-primary hover:brightness-95"
            >
              Add to plan
            </button>
          </div>
        </div>
        <p className="shrink-0 text-xl font-black text-primary">{priceLabel}</p>
      </div>
    </div>
  );
}

