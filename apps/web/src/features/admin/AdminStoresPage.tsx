import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { DataTable, type Column } from '../../components/DataTable';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { StarRating } from '../../components/StarRating';
import { toast } from '../../components/Toast';
import api, { apiData, getErrorMessage } from '../../lib/api-client';
import { createStoreSchema, type CreateStoreForm } from '../../lib/schemas';
import type { Paginated, StoreRow, User } from '../../lib/types';

export default function AdminStoresPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const owners = useQuery({
    queryKey: ['admin', 'owners'],
    queryFn: () =>
      apiData<Paginated<User>>(
        api.get('/admin/users', { params: { role: 'STORE_OWNER', limit: 100 } }),
      ),
  });

  const query = useQuery({
    queryKey: ['admin', 'stores', page, sortBy, order, search],
    queryFn: () =>
      apiData<Paginated<StoreRow>>(
        api.get('/admin/stores', {
          params: { page, limit: 10, sortBy, order, search: search || undefined },
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
      { key: 'name', header: 'Name', sortable: true, render: (r) => r.name },
      { key: 'email', header: 'Email', sortable: true, render: (r) => r.email },
      { key: 'address', header: 'Address', sortable: true, render: (r) => r.address },
      {
        key: 'rating',
        header: 'Avg rating',
        render: (r) => (
          <div className="flex items-center gap-2">
            <StarRating value={r.averageRating ?? 0} readOnly size="sm" />
            <span className="text-xs text-slate-500">{r.averageRating ?? '—'}</span>
          </div>
        ),
      },
      {
        key: 'owner',
        header: 'Owner',
        render: (r) => r.owner?.name ?? '—',
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
        <h1 className="text-2xl font-bold text-slate-900">Stores</h1>
        <Button onClick={() => setOpen(true)}>Add store</Button>
      </div>
      <Input
        label="Search name / address / email"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
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
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
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

      <Modal open={open} title="Add store" onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={handleSubmit((v) => createMut.mutate(v))}>
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" error={errors.email?.message} {...register('email')} />
          <Input label="Address" error={errors.address?.message} {...register('address')} />
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Owner</span>
            <select
              className="w-full rounded-token border border-slate-200 px-3 py-2 text-sm"
              {...register('ownerId')}
            >
              <option value="">Select owner</option>
              {owners.data?.items.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" loading={createMut.isPending} className="w-full">
            Create
          </Button>
        </form>
      </Modal>
    </div>
  );
}
