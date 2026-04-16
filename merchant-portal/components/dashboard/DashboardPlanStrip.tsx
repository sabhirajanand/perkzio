export default function DashboardPlanStrip() {
  return (
    <div className="bg-inverse-surface text-surface flex flex-wrap items-center justify-between rounded-lg p-6 shadow-2xl shadow-slate-900/10">
      <div className="flex items-center space-x-8">
        <div>
          <p className="text-outline-variant mb-1 text-[10px] font-black uppercase tracking-[0.15em]">Current Plan</p>
          <p className="font-headline text-primary-fixed-dim text-lg font-extrabold">Growth Elite</p>
        </div>
        <div className="hidden h-10 w-px bg-white/10 md:block" />
        <div>
          <p className="text-outline-variant mb-1 text-[10px] font-black uppercase tracking-[0.15em]">Renewal</p>
          <p className="text-surface-bright text-sm font-bold">Oct 24, 2024</p>
        </div>
      </div>
      <div className="mt-6 flex items-center space-x-12 lg:mt-0">
        <div className="w-48">
          <div className="text-outline-variant mb-2 flex justify-between text-xs font-bold uppercase tracking-widest">
            <span>Stamps</span>
            <span>12.5k / 20k</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
            <div className="h-full bg-primary-brand" style={{ width: '62.5%' }} />
          </div>
        </div>
        <div className="w-48">
          <div className="text-outline-variant mb-2 flex justify-between text-xs font-bold uppercase tracking-widest">
            <span>Customers</span>
            <span>1,204 / 5k</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
            <div className="h-full bg-secondary-brand" style={{ width: '24%' }} />
          </div>
        </div>
        <button
          type="button"
          className="font-headline rounded-full bg-white px-6 py-3 text-xs font-bold text-inverse-surface transition-all hover:bg-primary-brand hover:text-white"
        >
          Upgrade Plan
        </button>
      </div>
    </div>
  );
}
