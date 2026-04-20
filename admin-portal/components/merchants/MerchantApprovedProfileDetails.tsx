import Card from '@/components/ui/card';
import type { MerchantDetailDto } from '@/lib/platform/platformServer';

import MerchantRegistrationApplicationDetails from './MerchantRegistrationApplicationDetails';

export interface MerchantApprovedProfileDetailsProps {
  detail: MerchantDetailDto;
}

export default function MerchantApprovedProfileDetails({ detail }: MerchantApprovedProfileDetailsProps) {
  return (
    <div className="space-y-4">
      {detail.onboardingApplication ? (
        <div className="space-y-4">
          <MerchantRegistrationApplicationDetails
            application={{ ...detail.onboardingApplication, merchant: detail.merchant }}
            showLegacyPayloadSections
            showLinkedMerchantRecord={false}
          />
        </div>
      ) : (
        <Card className="rounded-[32px] p-6">
          <h2 className="text-sm font-semibold text-zinc-900">Onboarding application</h2>
          <p className="mt-2 text-sm text-zinc-500">No onboarding application is linked to this merchant.</p>
        </Card>
      )}
    </div>
  );
}
