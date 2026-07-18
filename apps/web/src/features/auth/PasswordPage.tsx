import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { KeyRound, Lock } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { toast } from '../../components/Toast';
import api, { apiData, getErrorMessage } from '../../lib/api-client';
import { passwordUpdateSchema, type PasswordUpdateForm } from '../../lib/schemas';

export default function PasswordPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordUpdateForm>({ resolver: zodResolver(passwordUpdateSchema) });

  const mutation = useMutation({
    mutationFn: (values: PasswordUpdateForm) =>
      apiData<{ message: string }>(api.patch('/auth/password', values)),
    onSuccess: (data) => {
      toast(data.message, 'success');
      reset();
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  return (
    <div className="mx-auto max-w-md">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 shadow-card backdrop-blur-md sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/35 to-transparent" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-white">
              Change password
            </h1>
            <p className="mt-0.5 text-sm text-white/45">
              Enter your current password, then choose a new one.
            </p>
          </div>
        </div>

        <form
          className="relative mt-6 space-y-4"
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
        >
          <Input
            label="Current password"
            type="password"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            hint="8–16 characters, with uppercase and a special character"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />

          <div className="flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-xs text-white/45">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-300/80" />
            <span>Your session stays active. Use the new password next time you sign in.</span>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
