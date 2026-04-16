export default function DashboardChannelMix() {
  return (
    <div className="kinetic-shadow rounded-lg bg-surface-container-lowest p-10">
      <h4 className="font-headline mb-10 text-xl font-bold">Stamp Channel Mix</h4>
      <div className="relative mx-auto mb-8 h-48 w-48">
        <div className="h-full w-full rounded-full border-[18px] border-primary-fixed-dim" />
        <div className="absolute inset-0 h-full w-full rotate-45 rounded-full border-[18px] border-secondary-brand border-l-transparent border-t-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-headline text-3xl font-black">74%</span>
          <span className="text-outline text-[10px] font-bold uppercase tracking-widest">Mobile App</span>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-secondary-brand" />
            <span className="font-medium text-on-surface">In-Store NFC</span>
          </div>
          <span className="font-bold">26%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-primary-fixed-dim" />
            <span className="font-medium text-on-surface">Mobile App</span>
          </div>
          <span className="font-bold">74%</span>
        </div>
      </div>
    </div>
  );
}
