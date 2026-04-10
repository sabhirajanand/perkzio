import OnboardingShell from '@/components/onboarding/OnboardingShell';
import LocationDocumentsForm from '@/components/onboarding/LocationDocumentsForm';

export default function LocationDocumentsPage() {
  return (
    <OnboardingShell
      title="Merchant onboarding"
      subtitle="Step 1 of 3 — Provide business details."
      step={1}
    >
      <LocationDocumentsForm />
    </OnboardingShell>
  );
}
