export interface CustomMerchantCardDesignProps {
  priceLabel: string;
}

export default function CustomMerchantCardDesign({ priceLabel }: CustomMerchantCardDesignProps) {
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-[0_0_28px_rgba(0,0,0,0.10)]">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-[10px] bg-black/80" aria-hidden />
          <div>
            <p className="text-base font-extrabold text-black">Custom Merchant Card Design</p>
            <p className="mt-1 text-sm text-zinc-600">
              Custom loyalty card design by Perkzio is included with all plans.
            </p>
          </div>
        </div>
        <p className="shrink-0 text-xl font-black text-primary">{priceLabel}</p>
      </div>
    </div>
  );
}

