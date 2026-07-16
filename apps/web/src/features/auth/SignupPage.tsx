import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Input } from '../../components/Input';
import { PageTransition } from '../../components/PageTransition';
import { toast } from '../../components/Toast';
import {
  DotPattern,
  ShimmerButton,
  ShineBorder,
} from '../../components/magicui';
import api, { apiData, getErrorMessage } from '../../lib/api-client';
import { homePathForRole, useAuthStore } from '../../lib/auth-store';
import { signupSchema, type SignupForm } from '../../lib/schemas';
import type { AuthResponse } from '../../lib/types';

export default function SignupPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const mutation = useMutation({
    mutationFn: (values: SignupForm) =>
      apiData<AuthResponse>(api.post('/auth/signup', values)),
    onSuccess: (data) => {
      setSession({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      toast('Account created', 'success');
      navigate(homePathForRole(data.user.role));
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  return (
    <PageTransition>
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
        <div className="pointer-events-none absolute inset-0 bg-grid-fade" />
        <DotPattern
          className="absolute inset-0 text-brand-400/30 [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]"
          width={22}
          height={22}
          cr={1.1}
          glow
        />
        <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-glow backdrop-blur-xl sm:p-8">
          <ShineBorder
            borderWidth={1.5}
            duration={12}
            shineColor={['#4f46e5', '#0ea5e9', '#a855f7']}
          />
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-sky-500 text-white shadow-glow">
            <UserPlus className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Create account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Join as a normal user to browse and rate stores
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit((v) => mutation.mutate(v))}
          >
            <Input
              label="Name"
              hint="20–60 characters"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Address" error={errors.address?.message} {...register('address')} />
            <Input
              label="Password"
              type="password"
              error={errors.password?.message}
              {...register('password')}
            />
            <ShimmerButton
              type="submit"
              className="w-full shadow-glow"
              borderRadius="0.75rem"
              background="linear-gradient(135deg, #4f46e5 0%, #6366f1 45%, #0ea5e9 100%)"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Creating…' : 'Create account'}
            </ShimmerButton>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link className="font-semibold text-brand-700 hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
