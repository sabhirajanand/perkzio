import { proxyToBackend } from '@/app/api/_lib/backend';
import { getMerchantAuthHeader } from '@/app/api/_lib/authHeader';

export async function merchantBackendGet<T>(path: string): Promise<T | null> {
  const auth = await getMerchantAuthHeader();
  if (!auth) return null;
  const result = await proxyToBackend({ method: 'GET', path, headers: auth });
  if (!result.ok) return null;
  return result.json as T;
}

