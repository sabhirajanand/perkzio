'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';

export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Intentionally minimal: logs help during early integration.
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Card className="p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Something went wrong</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Please retry, or go back to login.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => reset()}>Retry</Button>
            <Link href="/login">
              <Button variant="secondary">Go to login</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

