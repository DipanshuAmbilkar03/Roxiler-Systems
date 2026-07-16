import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Store } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { DataTable, type Column } from '../../components/DataTable';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { Select } from '../../components/Select';
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
      {
        key: 'name',
        header: 'Name',
        sortable: true,
        render: (r) => (
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-sky-700">
              <Store className="h-4 w-4" />
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
        key: 'rating',
        header: 'Avg rating',
        render: (r) => (
          <div className="flex items-center gap-2">
            <StarRating value={r.averageRating ?? 0} readOnly size="sm" />
            <Badge variant="warning">{r.averageRating ?? '—'}</Badge>
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
    <div className="space-y-5">
      <PageHeader
        eyebrow="Catalog"
        title="Stores"
        description="Manage store listings and assign owners."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Add store
          </Button>
        }
      />
      <Card className="!p-4">
        <Input
          label="Search name / address / email"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search stores…"
        />
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
