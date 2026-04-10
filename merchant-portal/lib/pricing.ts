export const pricing = {
  gstNote: 'All prices are exclusive of GST. Prices shown are per outlet per month.',
  plans: [
    {
      code: 'LITE',
      title: 'Lite',
      priceMonthly: '₹499/mo',
      highlights: ['1 outlet included (+₹499/mo each additional outlet)', 'Up to 100 active customers'],
      features: [
        { label: 'Loyalty cards (standard design)', value: '1 (+₹499 per extra card)' },
        { label: 'Loyalty cards (custom design by Perkzio)', value: 'On request (+₹499 per card)' },
        { label: 'Special offers module', value: '—' },
        { label: 'Push Notifications', value: '—' },
        { label: 'Campaigns', value: '—' },
        { label: 'Dashboard analytics', value: '—' },
        { label: 'Support channels', value: 'Email + Ticket' },
      ],
    },
    {
      code: 'GROWTH',
      title: 'Growth',
      badge: 'Popular',
      priceMonthly: '~~₹1,499/mo~~ ₹999/mo',
      trialNote: '30-day free trial (no payment details required to start).',
      annual: '₹9,990/yr (save 2 months; billed upfront)',
      highlights: ['1 outlet included (+₹999/mo each additional outlet)', 'Unlimited active customers'],
      features: [
        { label: 'Loyalty cards (standard design)', value: '2 (+₹499 per extra card)' },
        { label: 'Loyalty cards (custom design by Perkzio)', value: 'On request (+₹499 per card)' },
        { label: 'Special offers module', value: 'Unlimited' },
        { label: 'Push Notifications', value: 'Unlimited' },
        { label: 'Campaigns', value: '✓' },
        { label: 'Dashboard analytics', value: 'Advanced' },
        { label: 'Support channels', value: 'Email + Ticket + Phone' },
      ],
    },
    {
      code: 'PRO',
      title: 'Pro',
      priceMonthly: 'Talk to us',
      highlights: ['Custom plan for larger requirements'],
      features: [],
    },
  ],
} as const;

