import Card from '@/components/ui/card';

export interface OnboardingShellProps {
  title: string;
  subtitle?: string;
  step: 1 | 2 | 3;
  children: React.ReactNode;
}

function StepPill({ active, label, index }: { active: boolean; label: string; index: number }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={[
          'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold',
          active ? 'bg-primary text-white' : 'bg-zinc-100 text-zinc-700',
        ].join(' ')}
        aria-hidden="true"
      >
        {index}
      </div>
      <div className={active ? 'text-sm font-semibold text-zinc-900' : 'text-sm text-zinc-600'}>
        {label}
      </div>
    </div>
  );
}

export default function OnboardingShell({ title, subtitle, step, children }: OnboardingShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[360px_1fr] lg:items-start">
        <Card className="p-8 lg:sticky lg:top-10">
          <div className="text-sm font-semibold tracking-tight text-zinc-900">Perkzio</div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm leading-6 text-zinc-600">{subtitle}</p>
          ) : null}

          <div className="mt-8 space-y-5">
            <StepPill active={step === 1} index={1} label="Location & documents" />
            <StepPill active={step === 2} index={2} label="Plan & payment" />
            <StepPill active={step === 3} index={3} label="Success" />
          </div>
        </Card>

        <Card className="p-8">{children}</Card>
      </div>
    </div>
  );
}

