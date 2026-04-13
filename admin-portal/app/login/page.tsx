import { redirect } from 'next/navigation';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === 'string' && sp.next.length > 0 ? sp.next : '/dashboard';
  redirect(`/admin/login?next=${encodeURIComponent(next)}`);
}

