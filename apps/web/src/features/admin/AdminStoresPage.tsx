import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, Store } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { DataTable, type Column } from '../../components/DataTable';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { Select } from '../../components/Select';
import { StarRating } from '../../components/StarRating';
import { toast } from '../../components/Toast';
import api, { apiData, getErrorMessage } from '../../lib/api-client';
import { createStoreSchema, type CreateStoreForm } from '../../lib/schemas';
import type { Paginated, StoreRow, User } from '../../lib/types';
import { cn } from '../../lib/utils';

export default function AdminStoresPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [open, setOpen] = useState(false);

  const owners = useQuery({
    queryKey: ['admin', 'owners'],
    queryFn: () =>
      apiData<Paginated<User>>(
        api.get('/admin/users', { params: { role: 'STORE_OWNER', limit: 100 } }),
      ),
  });

  const query = useQuery({
    queryKey: ['admin', 'stores', page, sortBy, order, name, email, address],
    queryFn: () =>
      apiData<Paginated<StoreRow>>(
        api.get('/admin/stores', {
          params: {
            page,
            limit: 10,
            sortBy,
            order,
            name: name || undefined,
            email: email || undefined,
            address: address || undefined,
          },
        }),
      ),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateStoreForm>({ resolver: zodResolver(createStoreSchema) });

  const createMut = useMutation({
    mutationFn: (values: CreateStoreForm) =>
      apiData(
        api.post('/admin/stores', {
          ...values,
          ownerId: values.ownerId || undefined,
        }),
      ),
    onSuccess: () => {
      toast('Store created', 'success');
      setOpen(false);
      reset();
      void qc.invalidateQueries({ queryKey: ['admin', 'stores'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  const columns = useMemo<Column<StoreRow>[]>(
    () => [
      {
        key: 'name',
        header: 'Name',
        sortable: true,
        render: (r) => (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
              <Store className="h-4 w-4" />
            </span>
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
        key: 'rating',
        header: 'Avg rating',
        render: (r) => (
          <div className="flex items-center gap-2">
            <StarRating value={r.averageRating ?? 0} readOnly size="sm" />
            <Badge variant="warning">{r.averageRating ?? '-'}</Badge>
          </div>
        ),
      },
      {
        key: 'owner',
        header: 'Owner',
        render: (r) => (
          <span className="text-sm text-ink-soft">{r.owner?.name ?? 'Unassigned'}</span>
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
          <h1 className="font-display text-xl font-bold text-white">Stores</h1>
          <p className="mt-0.5 text-sm text-white/50">
            {query.data?.meta.total ?? 0} listings
          </p>
        </div>
        <Button onClick={() => setOpen(true)} size="sm" className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add store
        </Button>
      </div>

      <div className="grid gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 sm:grid-cols-3 sm:p-3">
        <label className="relative">
          <span className="sr-only">Name</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setPage(1);
            }}
            placeholder="Store name"
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
        title="Add store"
        description="Create a store and optionally link a store owner."
        onClose={() => setOpen(false)}
      >
        <form className="space-y-3" onSubmit={handleSubmit((v) => createMut.mutate(v))}>
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" error={errors.email?.message} {...register('email')} />
          <Input label="Address" error={errors.address?.message} {...register('address')} />
          <Select label="Owner" error={errors.ownerId?.message} {...register('ownerId')}>
            <option value="">Select owner</option>
            {owners.data?.items.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.email})
              </option>
            ))}
          </Select>
          <Button type="submit" loading={createMut.isPending} className="w-full">
            Create store
          </Button>
        </form>
      </Modal>
    </div>
  );
}

