'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronRight, Eye, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Spinner from '@/components/ui/spinner';
import RoleTabs from '@/components/auth/RoleTabs';
import {
  merchantLoginSchema,
  type MerchantLoginInput,
  type MerchantRole,
} from '@/lib/schemas/auth';

export default function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<MerchantRole>('MERCHANT_ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<MerchantLoginInput>({
    resolver: zodResolver(merchantLoginSchema),
    defaultValues: { role: 'MERCHANT_ADMIN', email: '', password: '', rememberMe: true },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(values: MerchantLoginInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, role }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(body?.message || 'Login failed');
      }
      toast.success('Welcome back');
      router.replace('/dashboard');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
      <RoleTabs
        value={role}
        onChange={(v) => {
          setRole(v);
          form.setValue('role', v);
        }}
      />

      <div className="space-y-2">
        <Label htmlFor="email">Email or Username</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@business.com"
          leadingIcon={<Mail size={20} />}
          autoComplete="email"
          {...form.register('email')}
        />
        {form.formState.errors.email?.message ? (
          <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <Label htmlFor="password">Password</Label>
          <button
            type="button"
            className="text-xs font-bold text-[#F32470] hover:underline"
            onClick={() => toast.message('Forgot password flow not wired yet')}
          >
            Forgot password?
          </button>
        </div>
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          leadingIcon={<Lock size={18} />}
          autoComplete="current-password"
          trailingSlot={
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#4B5563] transition-colors hover:bg-black/5 hover:text-zinc-900"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <Eye size={18} strokeWidth={2} />
            </button>
          }
          {...form.register('password')}
        />
        {form.formState.errors.password?.message ? (
          <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      <label
        htmlFor="rememberMe"
        className="flex cursor-pointer items-center gap-3 select-none"
      >
        <div className="relative h-5 w-5 shrink-0">
          <input
            id="rememberMe"
            type="checkbox"
            className="peer sr-only"
            {...form.register('rememberMe')}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full border border-[rgba(228,189,194,0.30)] bg-[#272B2A] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#F11E69]/40 peer-checked:border-[#F11E69] peer-checked:bg-[#F11E69] [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
          >
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </span>
        </div>
        <span className="text-sm font-medium text-[#4B5563]">Keep me signed in</span>
      </label>

      <div className="space-y-6">
        <Button
          type="submit"
          className="w-full h-[60px] rounded-full text-[18px] font-extrabold bg-[linear-gradient(99.13deg,#F11E69_0%,#FF4FA3_100%)] shadow-[0_10px_40px_-10px_rgba(241,30,105,0.40)]"
          disabled={isSubmitting}
        >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Spinner />
            Signing in
          </span>
        ) : (
            <span className="inline-flex items-center gap-2">
              Login to Portal <ChevronRight size={16} />
            </span>
        )}
        </Button>

        <div className="flex items-center justify-center gap-1 pt-[31.5px] text-sm text-[#4B5563]">
          <span className="font-medium">New to Perkzio?</span>
          <Link href="/register" className="font-bold text-black underline">
            Register your business
          </Link>
        </div>
      </div>
    </form>
  );
}
