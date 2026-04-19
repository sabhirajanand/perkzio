import type { LucideIcon } from 'lucide-react';
import {
  Award,
  Coffee,
  Crown,
  Heart,
  ImagePlus,
  Info,
  Lightbulb,
  Nfc,
  Palette,
  Star,
  Ticket,
} from 'lucide-react';

import Label from '@/components/ui/label';
import { cn } from '@/lib/utils/cn';

interface LoyaltyCardsWorkspaceProps {
  /** Reserved for future API wiring (static Figma layout for now). */
  isPreview?: boolean;
}

function SectionShell({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[#B3B1B4]/10 bg-white p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F11E69]/10">
          <Icon className="h-5 w-5 text-[#F11E69]" strokeWidth={2} aria-hidden />
        </span>
        <h2 className="font-headline text-lg font-bold leading-7 text-[#111827]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6B7280]">{children}</p>;
}

const STAMP_STYLE_OPTIONS: Array<{
  id: 'Classic' | 'Beverage' | 'Heart' | 'Premium';
  label: string;
  Icon: LucideIcon;
}> = [
  { id: 'Classic', label: 'Classic', Icon: Star },
  { id: 'Beverage', label: 'Beverage', Icon: Coffee },
  { id: 'Heart', label: 'Heart', Icon: Heart },
  { id: 'Premium', label: 'Premium', Icon: Award },
];

const STAMP_TOTAL = 10;
const STAMP_FILLED = 3;

function LiveDevicePreview() {
  return (
    <div className="relative flex flex-col items-center pt-2">
      <div className="relative z-20 -mb-2 inline-flex rounded-full bg-[#FF3377] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_8px_24px_-6px_rgba(255,51,119,0.55)]">
        Live Device Preview
      </div>

      <div className="relative z-10 w-full max-w-[340px] rounded-[2.75rem] border-[12px] border-[#1a1a1c] bg-[#1a1a1c] p-1.5 shadow-[0_28px_64px_-16px_rgba(0,0,0,0.5)]">
        <div className="relative overflow-visible rounded-[2.15rem] bg-[#E8E8ED]">
          <div className="flex justify-center pt-2.5" aria-hidden>
            <span className="h-6 w-[4.5rem] rounded-full bg-black shadow-inner" />
          </div>

          <div className="relative px-3 pb-3 pt-4">
            <div className="relative overflow-visible rounded-[26px] bg-gradient-to-br from-[#FF4B8B] via-[#FF3377] to-[#E91E63] p-5 pb-6 shadow-[0_16px_40px_-12px_rgba(255,51,119,0.45)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/95">Obsidian Brews</p>
                  <p className="mt-1.5 font-headline text-2xl font-bold leading-tight tracking-tight text-white md:text-[26px]">
                    Elite Loyalty
                  </p>
                </div>
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/25 backdrop-blur-[2px]"
                  aria-hidden
                >
                  <Nfc className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-5 gap-x-2.5 gap-y-3">
                {Array.from({ length: STAMP_TOTAL }).map((_, i) => {
                  const filled = i < STAMP_FILLED;
                  return (
                    <div key={i} className="flex justify-center">
                      {filled ? (
                        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white shadow-md">
                          <Star
                            className="h-[18px] w-[18px] fill-[#FF3377] text-[#FF3377]"
                            strokeWidth={0}
                            aria-hidden
                          />
                        </div>
                      ) : (
                        <div
                          className="h-[42px] w-[42px] rounded-full border-2 border-white/55 bg-white/10"
                          aria-hidden
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-white/95">7 more until reward</p>
                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
                  aria-label="Card info"
                >
                  <Info className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
              </div>

              <div
                className="relative z-30 mt-4 rounded-2xl border border-white/40 bg-white/95 p-3.5 shadow-lg backdrop-blur-sm sm:absolute sm:right-0 sm:top-[38%] sm:mt-0 sm:w-[min(calc(100%-0.5rem),210px)] sm:max-w-[210px] sm:translate-x-[min(22%,2.5rem)] sm:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)]"
                role="note"
              >
                <div className="flex gap-2.5">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#FF3377]" strokeWidth={2} aria-hidden />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#FF3377]">Pro Tip</p>
                    <p className="mt-1 text-[11px] leading-snug text-[#374151]">
                      High-contrast logos work best on the Electric Obsidian background.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF3377]" aria-hidden />
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#111827]">Next Unlock</span>
              </div>
              <div className="overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)]">
                <div
                  className="aspect-[16/9] w-full bg-gradient-to-br from-[#FFD6C9] via-[#F5E6D3] to-[#E8D4F0]"
                  role="img"
                  aria-label="Reward preview: cold brew drinks"
                />
                <div className="px-4 pb-4 pt-3">
                  <p className="font-headline text-base font-bold text-[#111827]">Free Signature Cold Brew</p>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#6B7280]">
                    Earn 10 stamps to unlock any signature cold brew from our seasonal menu. Valid at all locations.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-center gap-6 pb-1 text-[#9CA3AF]">
              <Coffee className="h-6 w-6" strokeWidth={1.5} aria-hidden />
              <Heart className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </div>
          </div>

          <div className="flex justify-center pb-2.5 pt-1" aria-hidden>
            <span className="h-1 w-28 rounded-full bg-black/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoyaltyCardsWorkspace({ isPreview: _isPreview = true }: LoyaltyCardsWorkspaceProps) {
  void _isPreview;
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="font-headline text-4xl font-semibold leading-none tracking-tight text-[#333235] md:text-5xl md:leading-none">
            Create Loyalty Experience
          </h1>
          <p className="max-w-3xl text-lg font-medium leading-7 text-[#4B5563]">
            Monitor and manage all claimed rewards across your branches.
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center gap-3 sm:gap-4">
          <button
            type="button"
            className="rounded-full border border-black bg-white px-7 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-zinc-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            className="rounded-full bg-gradient-to-r from-[#FF3377] to-[#F11E69] px-8 py-3 text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgba(255,51,119,0.5)] transition hover:brightness-105"
          >
            Publish Card
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12 xl:items-start xl:gap-10">
        <div className="space-y-8 xl:col-span-7">
          <SectionShell title="Visual Identity" icon={Palette}>
            <div className="grid gap-8 sm:grid-cols-2 sm:gap-6">
              <div className="space-y-3">
                <FieldLabel>Brand Color</FieldLabel>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="h-11 w-11 shrink-0 rounded-full bg-[#FF3377] shadow-sm ring-2 ring-black/15 ring-offset-2 ring-offset-white"
                    aria-label="Brand pink selected"
                  />
                  <span className="h-11 w-11 shrink-0 rounded-full bg-[#ADC7FF]" aria-hidden />
                  <span className="h-11 w-11 shrink-0 rounded-full bg-[#FF6BA8]" aria-hidden />
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-[#2d2d30] shadow-sm"
                    aria-hidden
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-white" />
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <FieldLabel>Logo Upload</FieldLabel>
                <button
                  type="button"
                  className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#FF3377] bg-white px-4 text-sm font-semibold text-[#FF3377] transition hover:bg-[#FF3377]/5"
                >
                  <ImagePlus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                  PNG or SVG (Max 2MB)
                </button>
              </div>
            </div>
          </SectionShell>

          <SectionShell title="Stamp Rules" icon={Ticket}>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <FieldLabel>Number of Stamps</FieldLabel>
                  <span className="shrink-0 text-sm font-bold text-[#FF3377]">10 Stamps</span>
                </div>
                <div className="mt-4 h-2 w-full rounded-sm bg-[#2d2d30]" aria-hidden />
              </div>

              <div className="space-y-4">
                <FieldLabel>Stamp Icon Style</FieldLabel>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {STAMP_STYLE_OPTIONS.map(({ id, label, Icon }) => {
                    const selected = id === 'Classic';
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={selected}
                        className={cn(
                          'flex min-h-[124px] flex-col items-center justify-center gap-3 rounded-2xl border-2 px-2 py-5 transition-colors',
                          selected
                            ? 'border-[#FF3377] bg-[#FFF5F9] shadow-sm'
                            : 'border-[#E5E7EB] bg-white hover:border-zinc-300 hover:bg-zinc-50/80',
                        )}
                      >
                        {id === 'Classic' ? (
                          <Star
                            className="h-8 w-8 shrink-0 fill-[#FF3377] text-[#FF3377]"
                            strokeWidth={0}
                            aria-hidden
                          />
                        ) : (
                          <Icon className="h-8 w-8 shrink-0 text-[#111827]" strokeWidth={2} aria-hidden />
                        )}
                        <span
                          className={cn(
                            'text-center text-sm font-semibold',
                            selected ? 'text-[#FF3377]' : 'text-[#111827]',
                          )}
                        >
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </SectionShell>

          <SectionShell title="Reward Details" icon={Crown}>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="loyalty-reward-title" className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B7280]">
                  Reward Title
                </Label>
                <input
                  id="loyalty-reward-title"
                  readOnly
                  value="Free Signature Cold Brew"
                  className="h-[52px] w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 text-base font-medium text-[#333235] outline-none ring-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loyalty-reward-desc" className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B7280]">
                  Reward Description
                </Label>
                <textarea
                  id="loyalty-reward-desc"
                  readOnly
                  rows={4}
                  value="Earn 10 stamps to unlock any signature cold brew from our seasonal menu. Valid at all locations."
                  className="w-full resize-none rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm leading-relaxed text-[#333235] outline-none"
                />
              </div>
            </div>
          </SectionShell>
        </div>

        <aside className="xl:col-span-5 xl:sticky xl:top-24">
          <LiveDevicePreview />
        </aside>
      </div>
    </div>
  );
}
