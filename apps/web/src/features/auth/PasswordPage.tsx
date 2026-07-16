import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { toast } from '../../components/Toast';
import { MagicCard, ShineBorder } from '../../components/magicui';
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
    <div className="mx-auto max-w-lg">
      <PageHeader
        eyebrow="Security"
        title="Update password"
        description="Choose a strong password you do not use elsewhere."
      />
      <MagicCard className="rounded-2xl" gradientFrom="#4f46e5" gradientTo="#0ea5e9">
        <div className="relative overflow-hidden p-5">
          <ShineBorder
            borderWidth={1}
            duration={14}
            shineColor={['#4f46e5', '#0ea5e9']}
          />
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">Account security</p>
              <p className="text-xs text-slate-500">Password changes apply immediately</p>
            </div>
          </div>
          <form
            className="space-y-4"
            onSubmit={handleSubmit((v) => mutation.mutate(v))}
          >
            <Input
              label="Current password"
              type="password"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <Input
              label="New password"
              type="password"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <Button type="submit" loading={mutation.isPending}>
              Save password
            </Button>
          </form>
        </div>
      </MagicCard>
    </div>
  );
}
