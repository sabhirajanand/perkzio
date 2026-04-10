import AdminLoginForm from '@/components/auth/AdminLoginForm';
import AdminLoginShell from '@/components/auth/AdminLoginShell';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const nextPath = typeof sp.next === 'string' && sp.next.length > 0 ? sp.next : '/dashboard';
  return (
    <AdminLoginShell
      title="Admin Login"
      subtitle={' '}
    >
      <AdminLoginForm nextPath={nextPath} />
    </AdminLoginShell>
  );
}

