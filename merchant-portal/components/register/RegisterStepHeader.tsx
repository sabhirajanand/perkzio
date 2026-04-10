import { cn } from '@/lib/utils/cn';

export interface RegisterStepHeaderProps {
  stepIndex: 1 | 2 | 3 | 4;
  totalSteps?: number;
  title: React.ReactNode;
  description: string;
}

export default function RegisterStepHeader({
  stepIndex,
  totalSteps = 4,
  title,
  description,
}: RegisterStepHeaderProps) {
  const stepLabel = `Step ${String(stepIndex).padStart(2, '0')}`;
  const totalLabel = String(totalSteps).padStart(2, '0');

  return (
    <header className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold uppercase tracking-[0.1em] text-[#323534]">{stepLabel}</span>
          <span className="h-px w-8 shrink-0 bg-[#323534]" aria-hidden />
          <span className="text-sm font-bold uppercase tracking-[0.1em] text-[#323534]">{totalLabel}</span>
        </div>
        {stepIndex <= 3 ? (
          <div className="flex shrink-0 items-center gap-2" role="presentation" aria-label="Registration progress">
            {Array.from({ length: totalSteps }, (_, i) => (
              <span
                key={i}
                className={cn(
                  'h-2 w-10 shrink-0 rounded-full transition-colors',
                  i === stepIndex - 1 ? 'bg-primary' : 'bg-[#323534]',
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
      <h1 className="text-5xl font-extrabold leading-none tracking-tight text-black [font-family:var(--font-register-display),ui-serif,Georgia,serif] md:text-[56px] md:leading-[56px]">
        {title}
      </h1>
      <p className="max-w-[672px] text-xl leading-[1.625] text-zinc-600">{description}</p>
    </header>
  );
}
