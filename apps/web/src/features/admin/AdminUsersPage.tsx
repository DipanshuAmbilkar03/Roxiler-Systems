import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { DataTable, type Column } from '../../components/DataTable';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { toast } from '../../components/Toast';
import api, { apiData, getErrorMessage } from '../../lib/api-client';
import { createUserSchema, type CreateUserForm } from '../../lib/schemas';
import type { Paginated, User } from '../../lib/types';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<User | null>(null);

  const query = useQuery({
    queryKey: ['admin', 'users', page, sortBy, order, name, email, role],
    queryFn: () =>
      apiData<Paginated<User>>(
        api.get('/admin/users', {
          params: {
            page,
            limit: 10,
            sortBy,
            order,
            name: name || undefined,
            email: email || undefined,
            role: role || undefined,
          },
        }),
      ),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'NORMAL_USER' },
  });

  const createMut = useMutation({
    mutationFn: (values: CreateUserForm) => apiData<User>(api.post('/admin/users', values)),
    onSuccess: () => {
      toast('User created', 'success');
      setOpen(false);
      reset();
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  const columns = useMemo<Column<User>[]>(
    () => [
      { key: 'name', header: 'Name', sortable: true, render: (r) => r.name },
      { key: 'email', header: 'Email', sortable: true, render: (r) => r.email },
      { key: 'address', header: 'Address', sortable: true, render: (r) => r.address },
      { key: 'role', header: 'Role', sortable: true, render: (r) => r.role },
      {
        key: 'actions',
        header: '',
        render: (r) => (
          <Button
            variant="ghost"
            className="!px-2 !py-1 text-xs"
            onClick={async () => {
              const u = await apiData<User>(api.get(`/admin/users/${r.id}`));
              setDetail(u);
            }}
          >
            View
          </Button>
        ),
      },
    ],
    [],
  );

  const onSort = (key: string) => {
    if (sortBy === key) setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(key);
      setOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <Button onClick={() => setOpen(true)}>Add user</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Role</span>
          <select
            className="w-full rounded-token border border-slate-200 px-3 py-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">All</option>
            <option value="ADMIN">ADMIN</option>
            <option value="NORMAL_USER">NORMAL_USER</option>
            <option value="STORE_OWNER">STORE_OWNER</option>
          </select>
        </label>
      </div>
      <DataTable
        columns={columns}
        rows={query.data?.items ?? []}
        rowKey={(r) => r.id}
        sortBy={sortBy}
        order={order}
        onSort={onSort}
        loading={query.isLoading}
      />
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          Page {query.data?.meta.page ?? page} / {query.data?.meta.totalPages ?? 1}
        </span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <Button
            variant="secondary"
            disabled={(query.data?.meta.page ?? 1) >= (query.data?.meta.totalPages ?? 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Modal open={open} title="Add user" onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={handleSubmit((v) => createMut.mutate(v))}>
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" error={errors.email?.message} {...register('email')} />
          <Input label="Address" error={errors.address?.message} {...register('address')} />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register('password')}
          />
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Role</span>
            <select
              className="w-full rounded-token border border-slate-200 px-3 py-2 text-sm"
              {...register('role')}
            >
              <option value="NORMAL_USER">NORMAL_USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="STORE_OWNER">STORE_OWNER</option>
            </select>
          </label>
          <Button type="submit" loading={createMut.isPending} className="w-full">
            Create
          </Button>
        </form>
      </Modal>

      <Modal open={!!detail} title="User detail" onClose={() => setDetail(null)}>
        {detail && (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <strong>Name:</strong> {detail.name}
            </p>
            <p>
              <strong>Email:</strong> {detail.email}
            </p>
            <p>
              <strong>Address:</strong> {detail.address}
            </p>
            <p>
              <strong>Role:</strong> {detail.role}
            </p>
            {detail.role === 'STORE_OWNER' && (
              <>
                <p>
                  <strong>Average rating:</strong> {detail.averageRating ?? '—'}
                </p>
                <p>
                  <strong>Stores:</strong>{' '}
                  {detail.ownedStores?.map((s) => s.name).join(', ') || '—'}
                </p>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
