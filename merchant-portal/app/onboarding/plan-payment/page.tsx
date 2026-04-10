import OnboardingShell from '@/components/onboarding/OnboardingShell';
import PlanPaymentForm from '@/components/onboarding/PlanPaymentForm';

export default function PlanPaymentPage() {
  return (
    <OnboardingShell title="Merchant onboarding" subtitle="Step 2 of 3 — Pick a plan." step={2}>
      <PlanPaymentForm />
    </OnboardingShell>
  );
}
