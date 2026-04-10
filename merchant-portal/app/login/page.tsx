import LoginForm from '@/components/auth/LoginForm';
import LoginShell from '@/components/auth/LoginShell';

export default function LoginPage() {
  return (
    <LoginShell
      title="Merchant Access"
      subtitle={'Welcome back. Enter your credentials to manage\nyour business portal.'}
    >
      <LoginForm />
    </LoginShell>
  );
}

