export default function RedemptionInsightsStrip() {
  return (
    <section
      className="grid grid-cols-1 gap-4 border-t border-[#B3B1B4]/10 bg-[#FAFAFA]/40 px-6 py-6 sm:px-8 lg:grid-cols-12 lg:gap-5"
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
  );
}
