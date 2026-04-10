'use client';

import { useEffect, useState } from 'react';

export interface AdminSession {
  authenticated: boolean;
  userType?: 'ADMIN' | 'SUPERADMIN';
  staff?: { id: string; roleId: string | null; permissions: string[] };
}

export function useAdminSession() {
  const [data, setData] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const res = await fetch('/api/platform/auth/me');
        const json = (await res.json().catch(() => null)) as AdminSession | null;
        if (!cancelled) setData(json);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading };
}

