export interface RegisterCarouselSlide {
  id: string;
  /** Lines shown stacked; `accentLineIndex` tints one line with brand pink (Figma highlight). */
  headlineLines: string[];
  accentLineIndex: number | null;
  subline: string;
}

export const registerCarouselSlides: RegisterCarouselSlide[] = [
  {
    id: 'hero',
    headlineLines: ['Launch your', 'Loyalty', 'Empire.'],
    accentLineIndex: 1,
    subline:
      'Empowering over 2,500 brands to turn casual visitors into lifelong advocates with high-velocity rewards.',
  },
  {
    id: 'security',
    headlineLines: ['Bank-Grade', 'Security'],
    accentLineIndex: 0,
    subline: 'Military-grade encryption for all your merchant and customer data.',
  },
  {
    id: 'setup',
    headlineLines: ['90-Second', 'Setup'],
    accentLineIndex: 1,
    subline: 'Simple, guided onboarding that gets you live before your coffee cools.',
  },
];
