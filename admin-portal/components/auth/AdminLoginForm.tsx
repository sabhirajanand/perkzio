'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Spinner from '@/components/ui/spinner';
import { adminLoginSchema, type AdminLoginInput } from '@/lib/schemas/adminAuth';

export interface AdminLoginFormProps {
  nextPath: string;
}

export default function AdminLoginForm({ nextPath }: AdminLoginFormProps) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: '', password: '', rememberMe: true },
    mode: 'onBlur',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(values: AdminLoginInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/platform/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message || 'Login failed');
      }
      toast.success('Welcome');
      router.replace(nextPath);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-7" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@perkzio.com"
          leadingIcon={<Mail size={20} />}
          autoComplete="email"
          {...form.register('email')}
        />
        {form.formState.errors.email?.message ? (
          <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
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

      <label htmlFor="rememberMe" className="flex cursor-pointer items-center gap-3 select-none">
        <input id="rememberMe" type="checkbox" className="h-4 w-4" {...form.register('rememberMe')} />
        <span className="text-sm font-medium text-[#4B5563]">Keep me signed in</span>
      </label>

      <Button
        type="submit"
        className="w-full h-[60px] rounded-full text-[18px] font-extrabold bg-[linear-gradient(99.13deg,#F11E69_0%,#FF4FA3_100%)]"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Spinner />
            Signing in
          </span>
        ) : (
          'Login'
        )}
      </Button>
    </form>
  );
}

