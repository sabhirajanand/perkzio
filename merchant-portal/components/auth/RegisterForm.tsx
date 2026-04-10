'use client';

import Link from 'next/link';
import Button from '@/components/ui/button';

export default function RegisterForm() {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-zinc-600">
        Merchant portal accounts are provisioned after onboarding approval. Use the onboarding form to
        submit your business details, then you’ll receive access.
      </p>
      <Link href="/register" className="block">
        <Button className="w-full" size="lg">
          Start merchant onboarding
        </Button>
      </Link>
    </div>
  );
}
