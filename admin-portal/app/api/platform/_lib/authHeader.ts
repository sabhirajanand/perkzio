import { cookies } from 'next/headers';

export async function getAdminAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('ap_session')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

