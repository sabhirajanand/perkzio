export type MerchantApplicationUiStatus = 'Pending' | 'Approved' | 'Rejected';

export function merchantApplicationStatusLabel(raw: string): MerchantApplicationUiStatus {
  if (raw === 'APPROVED') return 'Approved';
  if (raw === 'REJECTED') return 'Rejected';
  return 'Pending';
}

