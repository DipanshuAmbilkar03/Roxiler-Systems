import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { DataTable, type Column } from '../../components/DataTable';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { StarRating } from '../../components/StarRating';
import { toast } from '../../components/Toast';
import { BlurFade, MagicCard } from '../../components/magicui';
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
      {
        key: 'name',
        header: 'Store',
        sortable: true,
        render: (r) => (
          <div>
            <p className="font-semibold text-slate-900">{r.name}</p>
            <p className="mt-0.5 text-xs text-slate-500 sm:hidden">{r.address}</p>
          </div>
        ),
      },
      {
        key: 'address',
        header: 'Address',
        sortable: true,
        render: (r) => <span className="text-slate-600">{r.address}</span>,
      },
      {
        key: 'average',
        header: 'Overall',
        render: (r) => (
          <div className="flex items-center gap-2">
            <StarRating value={r.averageRating ?? 0} readOnly size="sm" />
            <Badge variant="warning">{r.averageRating ?? '—'}</Badge>
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
    <div className="space-y-5">
      <PageHeader
        eyebrow="Explore"
        title="Browse stores"
        description="Search by name or address, then leave or update your star rating."
      />
      <BlurFade delay={0.05}>
        <MagicCard className="rounded-2xl" gradientFrom="#6366f1" gradientTo="#0ea5e9">
          <div className="p-4">
            <div className="flex items-end gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-[2.35rem] h-4 w-4 text-slate-400" />
                <Input
                  label="Search stores"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="e.g. Green Market"
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </MagicCard>
      </BlurFade>
      <BlurFade delay={0.1}>
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
      </BlurFade>
      <Pagination
        page={query.data?.meta.page ?? page}
        totalPages={query.data?.meta.totalPages ?? 1}
        onPrev={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
      />
    </div>
  );
}
