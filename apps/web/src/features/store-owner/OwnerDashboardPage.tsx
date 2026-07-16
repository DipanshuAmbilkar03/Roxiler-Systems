import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Star, MessageSquareHeart } from 'lucide-react';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import { Badge } from '../../components/Badge';
import { DataTable, type Column } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { Skeleton } from '../../components/Skeleton';
import { StarRating } from '../../components/StarRating';
import { BlurFade, MagicCard, NumberTicker, ShineBorder } from '../../components/magicui';
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
        render: (r) => <span className="font-medium text-slate-900">{r.user.name}</span>,
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
        render: (r) => (
          <div className="flex items-center gap-2">
            <StarRating value={r.value} readOnly size="sm" />
            <Badge variant="warning">{r.value}</Badge>
          </div>
        ),
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
      <PageHeader
        eyebrow="Owner"
        title="Store performance"
        description={data?.stores.map((s) => s.name).join(' · ') || 'Insights for your stores'}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {isLoading ? (
          <>
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </>
        ) : (
          <>
            <BlurFade delay={0.05}>
              <MagicCard className="rounded-2xl" gradientFrom="#f59e0b" gradientTo="#fbbf24">
                <div className="relative overflow-hidden p-5">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-amber-400/20 to-transparent" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Average rating
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <p className="font-display text-3xl font-bold text-slate-900">
                          {data?.averageRating != null ? (
                            <NumberTicker
                              value={Number(data.averageRating)}
                              decimalPlaces={1}
                              className="font-display text-3xl font-bold"
                            />
                          ) : (
                            '—'
                          )}
                        </p>
                        <StarRating value={data?.averageRating ?? 0} readOnly size="lg" />
                      </div>
                    </div>
                    <span className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                      <Star className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              </MagicCard>
            </BlurFade>
            <BlurFade delay={0.1}>
              <AnimatedCounter
                value={data?.ratingsCount ?? 0}
                label="Total ratings"
                icon={MessageSquareHeart}
                accent="emerald"
              />
            </BlurFade>
          </>
        )}
      </div>
      <BlurFade delay={0.12}>
        <div className="relative overflow-hidden rounded-2xl">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-slate-900">Recent raters</h2>
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <ShineBorder
              borderWidth={1}
              duration={16}
              shineColor={['#4f46e5', '#0ea5e9']}
              className="rounded-2xl"
            />
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
          </div>
          <div className="mt-3">
            <Pagination
              page={data?.raters.meta.page ?? page}
              totalPages={data?.raters.meta.totalPages ?? 1}
              onPrev={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
            />
          </div>
        </div>
      </BlurFade>
    </div>
  );
}
