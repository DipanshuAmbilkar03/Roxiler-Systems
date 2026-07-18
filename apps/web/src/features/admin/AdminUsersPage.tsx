import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search } from 'lucide-react';
import { Avatar } from '../../components/Avatar';
import { KeyValueGrid } from '../../components/KeyValueGrid';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { DataTable, type Column } from '../../components/DataTable';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { SegmentedControl } from '../../components/SegmentedControl';
import { Select } from '../../components/Select';
import { toast } from '../../components/Toast';
import api, { apiData, getErrorMessage } from '../../lib/api-client';
import { createUserSchema, type CreateUserForm } from '../../lib/schemas';
import type { Paginated, User } from '../../lib/types';
import { cn } from '../../lib/utils';

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
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('');
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<User | null>(null);

  const query = useQuery({
    queryKey: ['admin', 'users', page, sortBy, order, name, email, address, role],
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
            address: address || undefined,
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
          <div className="flex items-center gap-3">
            <Avatar name={r.name} />
            <div>
              <p className="font-medium text-ink">{r.name}</p>
              <p className="font-mono text-[11px] text-muted sm:hidden">{r.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'email',
        header: 'Email',
        sortable: true,
        render: (r) => <span className="font-mono text-xs text-ink-soft">{r.email}</span>,
      },
      {
        key: 'address',
        header: 'Address',
        sortable: true,
        render: (r) => <span className="line-clamp-1 max-w-[14rem] text-ink-soft">{r.address}</span>,
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
            variant="secondary"
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-white">Users</h1>
          <p className="mt-0.5 text-sm text-white/50">
            {query.data?.meta.total ?? 0} accounts
          </p>
        </div>
        <Button onClick={() => setOpen(true)} size="sm" className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add user
        </Button>
      </div>

      {/* Compact single-row toolbar */}
      <div className="flex flex-col gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 sm:flex-row sm:items-center sm:p-3">
        <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-3">
          <label className="relative">
            <span className="sr-only">Name</span>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setPage(1);
              }}
              placeholder="Name"
              className={cn(
                'w-full rounded-lg border border-white/10 bg-black/25 py-2 pl-8 pr-2.5 text-sm text-white outline-none',
                'placeholder:text-white/35 focus:border-indigo-400/40',
              )}
            />
          </label>
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setPage(1);
            }}
            placeholder="Email"
            className={cn(
              'w-full rounded-lg border border-white/10 bg-black/25 px-2.5 py-2 text-sm text-white outline-none',
              'placeholder:text-white/35 focus:border-indigo-400/40',
            )}
          />
          <input
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setPage(1);
            }}
            placeholder="Address"
            className={cn(
              'w-full rounded-lg border border-white/10 bg-black/25 px-2.5 py-2 text-sm text-white outline-none',
              'placeholder:text-white/35 focus:border-indigo-400/40',
            )}
          />
        </div>
        <SegmentedControl
          ariaLabel="Filter role"
          className="w-full shrink-0 sm:w-auto"
          value={role || 'ALL'}
          onChange={(v) => {
            setRole(v === 'ALL' ? '' : v);
            setPage(1);
          }}
          options={[
            { value: 'ALL', label: 'All' },
            { value: 'ADMIN', label: 'Admin' },
            { value: 'STORE_OWNER', label: 'Owner' },
            { value: 'NORMAL_USER', label: 'User' },
          ]}
        />
      </div>

      <DataTable
        dense
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
        totalItems={query.data?.meta.total}
        onPrev={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
        onPage={setPage}
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

      <Modal open={!!detail} title="User profile" onClose={() => setDetail(null)} size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-gradient-to-r from-indigo-500/10 to-violet-500/10 p-4">
              <Avatar name={detail.name} size="lg" className="ring-2 ring-indigo-400/30" />
              <div className="min-w-0">
                <p className="font-display text-xl font-semibold text-white">{detail.name}</p>
                <p className="mt-0.5 truncate font-mono text-xs text-white/40">{detail.email}</p>
                <div className="mt-2">
                  <Badge variant={roleVariant[detail.role] ?? 'default'}>{detail.role}</Badge>
                </div>
              </div>
            </div>
            <KeyValueGrid
              items={[
                { label: 'Address', value: detail.address },
                {
                  label: 'Role',
                  value: <Badge variant={roleVariant[detail.role] ?? 'default'}>{detail.role}</Badge>,
                },
                ...(detail.role === 'STORE_OWNER'
                  ? [
                      {
                        label: 'Average rating',
                        value: (
                          <span className="font-display text-2xl font-semibold text-ink">
                            {detail.averageRating ?? '-'}
                          </span>
                        ),
                      },
                      {
                        label: 'Owned stores',
                        value: detail.ownedStores?.map((s) => s.name).join(', ') || '-',
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

