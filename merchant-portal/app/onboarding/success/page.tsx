import Link from 'next/link';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/button';

export default function OnboardingSuccessPage() {
  return (
    <OnboardingShell title="Merchant onboarding" subtitle="Step 3 of 3 — Completed." step={3}>
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Application submitted</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Thanks — we’ll review your details and share next steps. You’ll receive portal access once
          approved.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link href="/login">
            <Button>Back to login</Button>
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-zinc-700 hover:text-zinc-900">
            Go to dashboard
          </Link>
        </div>
      </div>
    </OnboardingShell>
  );
}
