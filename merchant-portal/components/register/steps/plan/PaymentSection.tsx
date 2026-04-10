import { useMemo, useState } from 'react';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import { cn } from '@/lib/utils/cn';

type PayTab = 'CARDS' | 'UPI' | 'WALLETS';

export interface PaymentSectionProps {
  disabled?: boolean;
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2l7 4v6c0 5-3.5 9.4-7 10-3.5-.6-7-5-7-10V6l7-4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 12.1l1.9 1.9 3.7-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 7a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M4 9h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7.5 14h4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BankIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 4l9 5H3l9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 9h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 9v9M10 9v9M14 9v9M18 9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 20h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ContactlessIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M7.5 8.8a6.2 6.2 0 010 6.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 7a8.5 8.5 0 010 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14.8 9a5.7 5.7 0 010 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 7a3 3 0 013-3h12v4H7a3 3 0 000 6h12v4H7a3 3 0 01-3-3V7z" stroke="currentColor" strokeWidth="2" />
      <path d="M17 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function PaymentSection({ disabled }: PaymentSectionProps) {
  const [tab, setTab] = useState<PayTab>('CARDS');

  const tabs = useMemo(
    () => [
      { key: 'CARDS' as const, label: 'Cards', icon: <CardIcon className="h-[25px] w-[25px]" /> },
      { key: 'UPI' as const, label: 'UPI / Net Banking', icon: <BankIcon className="h-[25px] w-[25px]" /> },
      { key: 'WALLETS' as const, label: 'Wallets', icon: <WalletIcon className="h-[25px] w-[25px]" /> },
    ],
    [],
  );

  return (
    <div className="rounded-[32px] bg-white p-8 shadow-[0_0_28px_rgba(0,0,0,0.10)]">
        <div className="flex items-center justify-between gap-6">
          <p className="text-2xl font-extrabold text-black">Secure Payment</p>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600">
            <ShieldIcon className="h-4 w-4" />
            PCI-DSS Compliant
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          {tabs.map((t) => {
            const active = t.key === tab;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                disabled={disabled}
                className={cn(
                  'inline-flex h-[50px] items-center gap-2 rounded-full px-6 text-base font-bold transition-colors',
                  active ? 'bg-primary text-white' : 'bg-[#F3F4F6] text-black hover:bg-zinc-200',
                  disabled ? 'opacity-60' : '',
                )}
              >
                <span className={cn(active ? 'text-white' : 'text-zinc-700')}>{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-4">
          {tab === 'CARDS' ? (
            <>
              <div className="grid gap-5 md:grid-cols-6">
                <div className="md:col-span-3">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="XXXX XXXX XXXX 4242"
                    disabled={disabled}
                    className="[&_input]:rounded-[16px] [&_input]:h-[60px] [&_input]:px-6"
                    trailingSlot={
                      <span className="grid h-8 w-8 place-items-center rounded-full ring-1 ring-zinc-400">
                        <ContactlessIcon className="h-5 w-5 text-zinc-500" />
                      </span>
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    disabled={disabled}
                    className="[&_input]:rounded-[16px] [&_input]:h-[60px] [&_input]:px-6"
                  />
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="***"
                    disabled={disabled}
                    className="[&_input]:rounded-[16px] [&_input]:h-[60px] [&_input]:px-6"
                  />
                </div>

                <div className="md:col-span-6">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="Johnathan Doe"
                    disabled={disabled}
                    className="[&_input]:rounded-[16px] [&_input]:h-[60px] [&_input]:px-6"
                  />
                </div>
              </div>
              <div className="rounded-[16px] border border-zinc-200 bg-white px-5 py-4 text-sm text-zinc-700">
                <span className="mr-3 inline-block h-3 w-3 rounded-full bg-black" aria-hidden />
                Securely save this card for a faster checkout experience next time. Your data is encrypted.
              </div>
            </>
          ) : tab === 'UPI' ? (
            <div className="rounded-[24px] bg-[#F3F4F6] p-6 text-sm font-semibold text-zinc-700">
              UPI / Net banking options will appear here at checkout.
            </div>
          ) : (
            <div className="rounded-[24px] bg-[#F3F4F6] p-6 text-sm font-semibold text-zinc-700">
              Wallet options will appear here at checkout.
            </div>
          )}
        </div>
    </div>
  );
}

