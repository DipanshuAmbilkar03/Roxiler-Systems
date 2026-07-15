import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { DataTable, type Column } from '../../components/DataTable';
import { Input } from '../../components/Input';
import { StarRating } from '../../components/StarRating';
import { toast } from '../../components/Toast';
import api, { apiData, getErrorMessage } from '../../lib/api-client';
import type { Paginated, StoreRow } from '../../lib/types';

export default function StoresPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const query = useQuery({
    queryKey: ['stores', page, sortBy, order, search],
    queryFn: () =>
      apiData<Paginated<StoreRow>>(
        api.get('/stores', {
          params: { page, limit: 10, sortBy, order, search: search || undefined },
        }),
      ),
  });

  const rateMut = useMutation({
    mutationFn: ({
      storeId,
      value,
      hasRating,
    }: {
      storeId: string;
      value: number;
      hasRating: boolean;
    }) =>
      hasRating
        ? apiData(api.patch(`/stores/${storeId}/ratings`, { value }))
        : apiData(api.post(`/stores/${storeId}/ratings`, { value })),
    onMutate: async ({ storeId, value }) => {
      await qc.cancelQueries({ queryKey: ['stores'] });
      const key = ['stores', page, sortBy, order, search];
      const prev = qc.getQueryData<Paginated<StoreRow>>(key);
      if (prev) {
        qc.setQueryData<Paginated<StoreRow>>(key, {
          ...prev,
          items: prev.items.map((s) =>
            s.id === storeId ? { ...s, userRating: value } : s,
          ),
        });
      }
      return { prev, key };
    },
    onError: (err, _v, ctx) => {
      if (ctx?.prev && ctx.key) qc.setQueryData(ctx.key, ctx.prev);
      toast(getErrorMessage(err), 'error');
    },
    onSuccess: () => toast('Rating saved', 'success'),
    onSettled: () => void qc.invalidateQueries({ queryKey: ['stores'] }),
  });

  const columns = useMemo<Column<StoreRow>[]>(
    () => [
      { key: 'name', header: 'Store', sortable: true, render: (r) => r.name },
      { key: 'address', header: 'Address', sortable: true, render: (r) => r.address },
      {
        key: 'average',
        header: 'Overall',
        render: (r) => (
          <div className="flex items-center gap-2">
            <StarRating value={r.averageRating ?? 0} readOnly size="sm" />
            <span className="text-xs text-slate-500">{r.averageRating ?? '—'}</span>
          </div>
        ),
      },
      {
        key: 'mine',
        header: 'Your rating',
        render: (r) => (
          <StarRating
            value={r.userRating ?? null}
            onChange={(value) =>
              rateMut.mutate({
                storeId: r.id,
                value,
                hasRating: r.userRating != null,
              })
            }
          />
        ),
      },
    ],
    [rateMut],
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
      <h1 className="text-2xl font-bold text-slate-900">Browse stores</h1>
      <Input
        label="Search by name or address"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="e.g. Green Market"
      />
      <DataTable
        columns={columns}
        rows={query.data?.items ?? []}
        rowKey={(r) => r.id}
        sortBy={sortBy}
        order={order}
        onSort={onSort}
        loading={query.isLoading}
        emptyMessage="No stores match your search"
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
    </div>
  );
}
