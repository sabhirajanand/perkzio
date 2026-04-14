import { ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export interface RegisterStepNavProps {
  onBack?: () => void;
  onContinue?: () => void;
  backLabel?: string;
  continueLabel?: string;
  className?: string;
  disabled?: boolean;
}

export default function RegisterStepNav({
  onBack,
  onContinue,
  backLabel = 'Back',
  continueLabel = 'Continue',
  className,
  disabled,
}: RegisterStepNavProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-primary bg-white px-6 text-base font-extrabold text-primary hover:bg-primary/5 disabled:opacity-60"
          aria-label={backLabel}
          disabled={disabled}
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
          {backLabel}
        </button>
      ) : (
        <span />
      )}

      {onContinue ? (
        <div className="flex flex-1 justify-center">
          <Button
            type="button"
            size="lg"
            onClick={onContinue}
            disabled={disabled}
            className="h-14 w-full max-w-[420px] rounded-full bg-gradient-to-r from-primary to-[#E91E8C] px-10 text-lg font-extrabold shadow-[0_15px_30px_-8px_rgba(241,30,105,0.45)] hover:brightness-95"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {continueLabel}
              <ArrowRight className="h-5 w-5" aria-hidden />
            </span>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

