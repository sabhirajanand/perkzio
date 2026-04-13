import { cookies } from 'next/headers';

export async function getMerchantAuthHeader(): Promise<{ Authorization: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('mp_session')?.value ?? null;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

