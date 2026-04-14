'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ComparePlansPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/compare-plans.html');
  }, [router]);

  return null;
}

