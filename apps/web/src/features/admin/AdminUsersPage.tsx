import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, UserRound } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { DataTable, type Column } from '../../components/DataTable';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { Select } from '../../components/Select';
import { toast } from '../../components/Toast';
import api, { apiData, getErrorMessage } from '../../lib/api-client';
import { createUserSchema, type CreateUserForm } from '../../lib/schemas';
import type { Paginated, User } from '../../lib/types';

const roleVariant: Record<string, 'brand' | 'success' | 'info' | 'default'> = {
  ADMIN: 'brand',
  STORE_OWNER: 'success',
  NORMAL_USER: 'info',
};

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
      {
        key: 'name',
        header: 'Name',
        sortable: true,
        render: (r) => (
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <UserRound className="h-4 w-4" />
            </span>
            <span className="font-medium text-slate-900">{r.name}</span>
          </div>
        ),
      },
      { key: 'email', header: 'Email', sortable: true, render: (r) => r.email },
      {
        key: 'address',
        header: 'Address',
        sortable: true,
        render: (r) => <span className="line-clamp-1 max-w-[14rem]">{r.address}</span>,
      },
      {
        key: 'role',
        header: 'Role',
        sortable: true,
        render: (r) => <Badge variant={roleVariant[r.role] ?? 'default'}>{r.role}</Badge>,
      },
      {
        key: 'actions',
        header: '',
        render: (r) => (
          <Button
            variant="ghost"
            size="sm"
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
    <div className="space-y-5">
      <PageHeader
        eyebrow="Directory"
        title="Users"
        description="Filter, inspect, and create platform users."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Add user
          </Button>
        }
      />
      <Card className="!p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="NORMAL_USER">NORMAL_USER</option>
            <option value="STORE_OWNER">STORE_OWNER</option>
          </Select>
        </div>
      </Card>
      <DataTable
        columns={columns}
        rows={query.data?.items ?? []}
        rowKey={(r) => r.id}
        sortBy={sortBy}
        order={order}
        onSort={onSort}
        loading={query.isLoading}
      />
      <Pagination
        page={query.data?.meta.page ?? page}
        totalPages={query.data?.meta.totalPages ?? 1}
        onPrev={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
      />

      <Modal
        open={open}
        title="Add user"
        description="Create an admin, store owner, or normal user."
        onClose={() => setOpen(false)}
      >
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
          <Select label="Role" error={errors.role?.message} {...register('role')}>
            <option value="NORMAL_USER">NORMAL_USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="STORE_OWNER">STORE_OWNER</option>
          </Select>
          <Button type="submit" loading={createMut.isPending} className="w-full">
            Create user
          </Button>
        </form>
      </Modal>

      <Modal open={!!detail} title="User detail" onClose={() => setDetail(null)}>
        {detail && (
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</p>
              <p className="mt-1 font-medium text-slate-900">{detail.name}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                <p className="mt-1 text-slate-800">{detail.email}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</p>
                <div className="mt-1">
                  <Badge variant={roleVariant[detail.role] ?? 'default'}>{detail.role}</Badge>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Address</p>
              <p className="mt-1 text-slate-800">{detail.address}</p>
            </div>
            {detail.role === 'STORE_OWNER' && (
              <>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Average rating
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {detail.averageRating ?? '—'}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Stores
                  </p>
                  <p className="mt-1 text-slate-800">
                    {detail.ownedStores?.map((s) => s.name).join(', ') || '—'}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
