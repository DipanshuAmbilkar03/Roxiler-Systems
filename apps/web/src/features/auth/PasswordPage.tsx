import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
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
      <h1 className="text-2xl font-bold text-slate-900">Update password</h1>
      <form
        className="mt-6 space-y-4 rounded-token border border-slate-200 bg-white p-5 shadow-sm"
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
          Save
        </Button>
      </form>
    </div>
  );
}
