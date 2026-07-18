import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { MessageSquareHeart, Star, Store } from 'lucide-react';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { DataTable, type Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { SegmentedControl } from '../../components/SegmentedControl';
import { Skeleton } from '../../components/Skeleton';
import { StarRating } from '../../components/StarRating';
import api, { apiData } from '../../lib/api-client';
import type { OwnerDashboard } from '../../lib/types';
import { cn } from '../../lib/utils';

type Rater = OwnerDashboard['raters']['items'][number];
type Tab = 'overview' | 'feedback';

export default function OwnerDashboardPage() {
  const [tab, setTab] = useState<Tab>('overview');
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

  const distribution = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of data?.raters.items ?? []) {
      const v = r.value as 1 | 2 | 3 | 4 | 5;
      if (counts[v] != null) counts[v] += 1;
    }
    return counts;
  }, [data?.raters.items]);

  const maxDist = Math.max(1, ...Object.values(distribution));

  const quality =
    data?.averageRating != null && Number(data.averageRating) >= 4
      ? 'Strong'
      : data?.averageRating != null && Number(data.averageRating) >= 3
        ? 'Steady'
        : data?.averageRating != null
          ? 'Needs attention'
          : 'No ratings yet';

  const columns = useMemo<Column<Rater>[]>(
    () => [
      {
        key: 'userName',
        header: 'Name',
        sortable: true,
        render: (r) => (
          <div className="flex items-center gap-2.5">
            <Avatar name={r.user.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{r.user.name}</p>
              <p className="truncate font-mono text-[11px] text-muted sm:hidden">{r.user.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'userEmail',
        header: 'Email',
        sortable: true,
        render: (r) => <span className="font-mono text-xs text-ink-soft">{r.user.email}</span>,
      },
      {
        key: 'value',
        header: 'Rating',
        sortable: true,
        render: (r) => (
          <div className="flex items-center gap-2">
            <StarRating value={r.value} readOnly size="sm" />
            <Badge variant="warning">{r.value}</Badge>
          </div>
        ),
      },
      {
        key: 'comment',
        header: 'Comment',
        render: (r) =>
          r.comment ? (
            <p className="max-w-[16rem] truncate text-sm text-white/70" title={r.comment}>
              {r.comment}
            </p>
          ) : (
            <span className="text-xs text-white/35">-</span>
          ),
      },
      {
        key: 'createdAt',
        header: 'Date',
        sortable: true,
        render: (r) => (
          <span className="font-mono text-xs text-muted">
            {new Date(r.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: 'store',
        header: 'Store',
        render: (r) => <span className="text-sm text-ink-soft">{r.store.name}</span>,
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-white">Owner dashboard</h1>
          <p className="mt-0.5 text-sm text-white/50">Track ratings and customer feedback.</p>
        </div>
        <div data-tour="owner-tabs" className="w-full sm:w-auto">
          <SegmentedControl
            ariaLabel="Owner dashboard sections"
            className="w-full"
            value={tab}
            onChange={(v) => setTab(v as Tab)}
            options={[
              { value: 'overview', label: 'Overview' },
              { value: 'feedback', label: 'Feedback' },
            ]}
          />
        </div>
      </div>

      {tab === 'overview' ? (
        <div className="space-y-4" data-tour="owner-stats">
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-300/80">
                  Average rating
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="font-display text-3xl font-bold text-white">
                    {data?.averageRating != null ? Number(data.averageRating).toFixed(1) : '-'}
                  </p>
                  <StarRating value={data?.averageRating ?? 0} readOnly size="sm" />
                </div>
                <p className="mt-1 text-xs text-white/45">{quality}</p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-300/80">
                  Total ratings
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <MessageSquareHeart className="h-5 w-5 text-cyan-300" />
                  <p className="font-display text-3xl font-bold text-white">
                    {data?.ratingsCount ?? 0}
                  </p>
                </div>
                <p className="mt-1 text-xs text-white/45">Across your stores</p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-300/80">
                  Your stores
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Store className="h-5 w-5 text-violet-300" />
                  <p className="font-display text-3xl font-bold text-white">
                    {data?.stores?.length ?? 0}
                  </p>
                </div>
                <p className="mt-1 text-xs text-white/45">Assigned to you</p>
              </div>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                Score mix (this page)
              </p>
              {isLoading ? (
                <Skeleton className="h-28 w-full rounded-lg" />
              ) : (
                <div className="space-y-2">
                  {([5, 4, 3, 2, 1] as const).map((stars) => (
                    <div key={stars} className="flex items-center gap-2 text-xs">
                      <span className="w-10 shrink-0 font-mono text-muted">
                        {stars}{' '}
                        <Star className="inline h-3 w-3 fill-amber-300 text-amber-300" />
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                          style={{
                            width: `${Math.max(
                              distribution[stars] ? 8 : 0,
                              (distribution[stars] / maxDist) * 100,
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="w-5 text-right font-mono text-muted">
                        {distribution[stars]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                Your stores
              </p>
              {(data?.stores?.length ?? 0) === 0 && !isLoading ? (
                <p className="text-sm text-white/45">No stores assigned yet.</p>
              ) : (
                <ul className="space-y-2">
                  {data?.stores.map((store) => (
                    <li
                      key={store.id}
                      className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
                        <Store className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{store.name}</p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-white/45">{store.address}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTab('feedback')}
            className={cn(
              'w-full rounded-xl border border-indigo-400/25 bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-100 transition',
              'hover:bg-indigo-500/15',
            )}
          >
            View customer feedback table
          </button>
        </div>
      ) : (
        <div className="space-y-3" data-tour="owner-raters">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">Customer feedback</h2>
              <p className="text-sm text-white/45">Recent raters and written comments.</p>
            </div>
            <Badge variant="info">Live</Badge>
          </div>

          <DataTable
            dense
            columns={columns}
            rows={data?.raters.items ?? []}
            rowKey={(r) => r.id}
            sortBy={sortBy}
            order={order}
            onSort={onSort}
            loading={isLoading}
            emptyMessage="No ratings yet"
          />
          <Pagination
            page={data?.raters.meta.page ?? page}
            totalPages={data?.raters.meta.totalPages ?? 1}
            totalItems={data?.raters.meta.total}
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
            onPage={setPage}
          />
        </div>
      )}
    </div>
  );
}
