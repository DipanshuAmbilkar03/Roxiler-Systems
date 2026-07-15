import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import { Button } from '../../components/Button';
import { DataTable, type Column } from '../../components/DataTable';
import { StarRating } from '../../components/StarRating';
import api, { apiData } from '../../lib/api-client';
import type { OwnerDashboard } from '../../lib/types';

type Rater = OwnerDashboard['raters']['items'][number];

export default function OwnerDashboardPage() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading } = useQuery({
    queryKey: ['owner', 'dashboard', page, sortBy, order],
    queryFn: () =>
      apiData<OwnerDashboard>(
        api.get('/store-owner/dashboard', {
          params: { page, limit: 10, sortBy, order },
        }),
      ),
  });

  const columns = useMemo<Column<Rater>[]>(
    () => [
      {
        key: 'userName',
        header: 'Name',
        sortable: true,
        render: (r) => r.user.name,
      },
      {
        key: 'userEmail',
        header: 'Email',
        sortable: true,
        render: (r) => r.user.email,
      },
      {
        key: 'value',
        header: 'Rating',
        sortable: true,
        render: (r) => <StarRating value={r.value} readOnly size="sm" />,
      },
      {
        key: 'createdAt',
        header: 'Date',
        sortable: true,
        render: (r) => new Date(r.createdAt).toLocaleString(),
      },
      {
        key: 'store',
        header: 'Store',
        render: (r) => r.store.name,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Store owner dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          {data?.stores.map((s) => s.name).join(' · ') || 'Your stores'}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {isLoading ? (
          <>
            <div className="h-28 animate-pulse rounded-token bg-slate-200" />
            <div className="h-28 animate-pulse rounded-token bg-slate-200" />
          </>
        ) : (
          <>
            <div className="rounded-token border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Average rating
              </p>
              <div className="mt-2 flex items-center gap-3">
                <p className="text-3xl font-bold text-slate-900">
                  {data?.averageRating ?? '—'}
                </p>
                <StarRating value={data?.averageRating ?? 0} readOnly size="lg" />
              </div>
            </div>
            <AnimatedCounter value={data?.ratingsCount ?? 0} label="Total ratings" />
          </>
        )}
      </div>
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Raters</h2>
        <DataTable
          columns={columns}
          rows={data?.raters.items ?? []}
          rowKey={(r) => r.id}
          sortBy={sortBy}
          order={order}
          onSort={onSort}
          loading={isLoading}
          emptyMessage="No ratings yet"
        />
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <span>
            Page {data?.raters.meta.page ?? page} / {data?.raters.meta.totalPages ?? 1}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </Button>
            <Button
              variant="secondary"
              disabled={(data?.raters.meta.page ?? 1) >= (data?.raters.meta.totalPages ?? 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
