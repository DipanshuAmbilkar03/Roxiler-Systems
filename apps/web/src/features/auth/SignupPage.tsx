import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { PageTransition } from '../../components/PageTransition';
import { toast } from '../../components/Toast';
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
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
        <div className="rounded-token border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
          <p className="mt-1 text-sm text-slate-500">Normal users only</p>
          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit((v) => mutation.mutate(v))}
          >
            <Input label="Name (20–60 chars)" error={errors.name?.message} {...register('name')} />
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Input
              label="Address"
              error={errors.address?.message}
              {...register('address')}
            />
            <Input
              label="Password"
              type="password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" className="w-full" loading={mutation.isPending}>
              Sign up
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600">
            Have an account?{' '}
            <Link className="font-medium text-brand-700 hover:underline" to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
